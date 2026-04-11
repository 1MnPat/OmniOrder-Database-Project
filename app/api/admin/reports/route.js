import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { badRequest, ok, serverError } from '@/lib/response';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const groupBy = searchParams.get('group_by') || 'day';

    if (!['day', 'week', 'month'].includes(groupBy)) {
      return badRequest('group_by must be day, week, or month');
    }

    let periodExpr = 'TRUNC(o.order_date)';
    if (groupBy === 'week') periodExpr = "TRUNC(o.order_date, 'IW')";
    if (groupBy === 'month') periodExpr = "TRUNC(o.order_date, 'MM')";

    const binds = {};
    const cond = [];
    if (dateFrom) {
      binds.date_from = new Date(`${dateFrom}T00:00:00.000Z`);
      cond.push('o.order_date >= :date_from');
    }
    if (dateTo) {
      binds.date_to = new Date(`${dateTo}T23:59:59.999Z`);
      cond.push('o.order_date <= :date_to');
    }
    const whereSql = cond.length ? `WHERE ${cond.join(' AND ')}` : '';

    const sql = `
      SELECT
        ${periodExpr} AS "period",
        NVL(SUM(o.total_amount), 0) AS "revenue",
        COUNT(*) AS "orders"
      FROM orders o
      ${whereSql}
      GROUP BY ${periodExpr}
      ORDER BY 1 ASC`;

    const res = await executeQuery(sql, binds);

    return ok({
      report: res.rows || [],
    });
  } catch (err) {
    console.error('GET /admin/reports:', err);
    return serverError('Something went wrong');
  }
}

export const GET = requireAuth(getHandler, ['admin']);
