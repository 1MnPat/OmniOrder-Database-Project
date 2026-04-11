import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { ok, serverError } from '@/lib/response';

async function getHandler() {
  try {
    const revRes = await executeQuery(
      `SELECT NVL(SUM(total_amount), 0) AS "revenue" FROM orders`
    );
    const revenue = Number(revRes.rows?.[0]?.revenue ?? revRes.rows?.[0]?.REVENUE ?? 0);

    const statusRes = await executeQuery(
      `WITH latest AS (
         SELECT order_id, status_code,
                ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY update_timestamp DESC) rn
         FROM order_status_history
       )
       SELECT l.status_code AS "status_code", COUNT(*) AS "count"
       FROM latest l
       WHERE l.rn = 1
       GROUP BY l.status_code`
    );

    const topRes = await executeQuery(
      `SELECT
         p.product_id AS "product_id",
         p.product_name AS "product_name",
         SUM(oi.quantity) AS "total_sold"
       FROM order_items oi
       JOIN products p ON p.product_id = oi.product_id
       GROUP BY p.product_id, p.product_name
       ORDER BY SUM(oi.quantity) DESC
       FETCH FIRST 5 ROWS ONLY`
    );

    const lowRes = await executeQuery(
      `SELECT
         product_id AS "product_id",
         product_name AS "product_name",
         stock_quantity AS "stock_quantity"
       FROM products
       WHERE stock_quantity < 10 AND is_active = 1
       ORDER BY stock_quantity ASC`
    );

    return ok({
      revenue,
      ordersByStatus: statusRes.rows || [],
      topProducts: topRes.rows || [],
      lowStock: lowRes.rows || [],
    });
  } catch (err) {
    console.error('GET /admin/dashboard:', err);
    return serverError('Something went wrong');
  }
}

export const GET = requireAuth(getHandler, ['admin']);
