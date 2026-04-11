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
    const { page, limit, offset } = parsePagination(searchParams);

    const binds = { offset, limit };

    const countRes = await executeQuery(
      `SELECT COUNT(*) AS "cnt" FROM price_audit_log`,
      {}
    );
    const total = Number(countRes.rows?.[0]?.cnt ?? countRes.rows?.[0]?.CNT ?? 0);

    const dataRes = await executeQuery(
      `SELECT
         pal.log_id AS "log_id",
         pal.product_id AS "product_id",
         p.product_name AS "product_name",
         pal.old_price AS "old_price",
         pal.new_price AS "new_price",
         pal.changed_by AS "changed_by",
         a.email AS "admin_email",
         pal.changed_at AS "changed_at"
       FROM price_audit_log pal
       JOIN products p ON p.product_id = pal.product_id
       JOIN admins a ON a.admin_id = pal.changed_by
       ORDER BY pal.changed_at DESC, pal.log_id DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      binds
    );

    const logs = dataRes.rows || [];
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return ok({
      logs,
      total,
      page,
      totalPages,
    });
  } catch (err) {
    console.error('GET /admin/audit/prices:', err);
    return serverError('Something went wrong');
  }
}

export const GET = requireAuth(getHandler, ['admin']);
