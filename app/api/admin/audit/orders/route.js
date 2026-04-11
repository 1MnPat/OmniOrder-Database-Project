import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { ok, serverError } from '@/lib/response';

function parsePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const { page, limit, offset } = parsePagination(searchParams);

    const conditions = [];
    const binds = { offset, limit };

    if (orderId) {
      binds.filter_order_id = Number(orderId);
      conditions.push('osh.order_id = :filter_order_id');
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await executeQuery(
      `SELECT COUNT(*) AS "cnt"
       FROM order_status_history osh
       JOIN orders o ON o.order_id = osh.order_id
       ${whereSql}`,
      binds
    );
    const total = Number(countRes.rows?.[0]?.cnt ?? countRes.rows?.[0]?.CNT ?? 0);

    const dataRes = await executeQuery(
      `SELECT
         osh.history_id AS "history_id",
         osh.order_id AS "order_id",
         osh.status_code AS "status_code",
         osh.update_timestamp AS "update_timestamp",
         o.customer_id AS "customer_id",
         o.total_amount AS "total_amount"
       FROM order_status_history osh
       JOIN orders o ON o.order_id = osh.order_id
       ${whereSql}
       ORDER BY osh.update_timestamp DESC, osh.history_id DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      binds
    );

    const history = dataRes.rows || [];
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return ok({
      history,
      total,
      page,
      totalPages,
    });
  } catch (err) {
    console.error('GET /admin/audit/orders:', err);
    return serverError('Something went wrong');
  }
}

export const GET = requireAuth(getHandler, ['admin']);
