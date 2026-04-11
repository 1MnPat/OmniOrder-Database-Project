import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { badRequest, ok, serverError } from '@/lib/response';

async function resolveParams(params) {
  if (params && typeof params.then === 'function') return await params;
  return params;
}

async function patchHandler(request, context) {
  try {
    const { id } = await resolveParams(context.params);
    const cid = Number(id);
    const body = await request.json();
    const { is_active } = body || {};

    if (is_active !== 0 && is_active !== 1) {
      return badRequest('is_active must be 0 or 1');
    }

    await executeQuery(
      `UPDATE customers SET is_active = :is_active WHERE customer_id = :id`,
      { is_active, id: cid }
    );

    return ok({ message: 'Customer updated' });
  } catch (err) {
    console.error('PATCH /admin/customers/[id]:', err);
    return serverError('Something went wrong');
  }
}

export const PATCH = requireAuth(patchHandler, ['admin']);
