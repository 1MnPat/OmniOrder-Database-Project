import { callProcedure } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { badRequest, ok, serverError } from '@/lib/response';

const ALLOWED = new Set([
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]);

async function resolveParams(params) {
  if (params && typeof params.then === 'function') return await params;
  return params;
}

async function patchHandler(request, context) {
  try {
    const { id } = await resolveParams(context.params);
    const oid = Number(id);
    const body = await request.json();
    const { status_code } = body || {};

    if (!status_code || !ALLOWED.has(status_code)) {
      return badRequest('Invalid status_code');
    }

    await callProcedure(
      `BEGIN sp_update_order_status(:order_id, :status_code); END;`,
      { order_id: oid, status_code }
    );

    return ok({ message: 'Order status updated' });
  } catch (err) {
    console.error('PATCH /orders/[id]/status:', err);
    return serverError('Something went wrong');
  }
}

export const PATCH = requireAuth(patchHandler, ['admin']);
