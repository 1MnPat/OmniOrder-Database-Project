import { callProcedure, executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import {
  conflict,
  forbiddenResponse,
  notFound,
  ok,
  serverError,
} from '@/lib/response';

const BLOCK_CANCEL = new Set(['CANCELLED', 'DELIVERED']);

async function resolveParams(params) {
  if (params && typeof params.then === 'function') return await params;
  return params;
}

async function postHandler(request, context) {
  try {
    const { id } = await resolveParams(context.params);
    const orderId = Number(id);
    if (Number.isNaN(orderId)) return notFound('Order not found');

    const customerId = request.user.id;

    const orderRes = await executeQuery(
      `SELECT customer_id AS "customer_id" FROM orders WHERE order_id = :id`,
      { id: orderId }
    );
    const row = orderRes.rows?.[0];
    if (!row) return notFound('Order not found');

    if (Number(row.customer_id) !== Number(customerId)) {
      return forbiddenResponse('Access denied');
    }

    const statusRes = await executeQuery(
      `SELECT status_code AS "status_code"
       FROM (
         SELECT h.status_code,
                ROW_NUMBER() OVER (PARTITION BY h.order_id ORDER BY h.update_timestamp DESC) rn
         FROM order_status_history h
         WHERE h.order_id = :id
       )
       WHERE rn = 1`,
      { id: orderId }
    );
    const latest = statusRes.rows?.[0]?.status_code ?? statusRes.rows?.[0]?.STATUS_CODE;

    if (latest && BLOCK_CANCEL.has(String(latest))) {
      return conflict('This order cannot be cancelled');
    }

    await callProcedure(
      `BEGIN sp_update_order_status(:order_id, :status_code); END;`,
      { order_id: orderId, status_code: 'CANCELLED' }
    );

    return ok({ message: 'Order cancelled' });
  } catch (err) {
    console.error('POST /orders/[id]/cancel:', err);
    return serverError('Something went wrong');
  }
}

export const POST = requireAuth(postHandler, ['customer']);
