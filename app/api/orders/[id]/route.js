import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { ok, forbiddenResponse, notFound, serverError } from '@/lib/response';

async function resolveParams(params) {
  if (params && typeof params.then === 'function') return await params;
  return params;
}

async function getHandler(request, context) {
  try {
    const { id } = await resolveParams(context.params);
    const oid = Number(id);
    if (Number.isNaN(oid)) return notFound('Order not found');

    const role = request.user.role;
    const userId = request.user.id;

    const orderRes = await executeQuery(
      `SELECT
         o.order_id AS "order_id",
         o.customer_id AS "customer_id",
         o.order_date AS "order_date",
         o.total_amount AS "total_amount"
       FROM orders o
       WHERE o.order_id = :id`,
      { id: oid }
    );

    const order = orderRes.rows?.[0];
    if (!order) return notFound('Order not found');

    if (role === 'customer' && Number(order.customer_id) !== Number(userId)) {
      return forbiddenResponse('Access denied');
    }

    const itemsRes = await executeQuery(
      `SELECT
         oi.order_item_id AS "order_item_id",
         oi.order_id AS "order_id",
         oi.product_id AS "product_id",
         oi.quantity AS "quantity",
         oi.unit_price AS "unit_price",
         p.product_name AS "product_name",
         p.image_url AS "image_url"
       FROM order_items oi
       JOIN products p ON p.product_id = oi.product_id
       WHERE oi.order_id = :id
       ORDER BY oi.order_item_id`,
      { id: oid }
    );

    const histRes = await executeQuery(
      `SELECT
         history_id AS "history_id",
         order_id AS "order_id",
         status_code AS "status_code",
         update_timestamp AS "update_timestamp"
       FROM order_status_history
       WHERE order_id = :id
       ORDER BY update_timestamp ASC`,
      { id: oid }
    );

    return ok({
      order,
      items: itemsRes.rows || [],
      statusHistory: histRes.rows || [],
    });
  } catch (err) {
    console.error('GET /orders/[id]:', err);
    return serverError('Something went wrong');
  }
}

export const GET = requireAuth(getHandler, ['customer', 'admin']);
