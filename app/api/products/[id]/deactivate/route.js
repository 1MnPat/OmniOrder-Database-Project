import { callProcedure } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { ok, serverError } from '@/lib/response';

async function resolveParams(params) {
  if (params && typeof params.then === 'function') return await params;
  return params;
}

async function patchHandler(request, context) {
  try {
    const { id } = await resolveParams(context.params);
    const productId = Number(id);
    const adminId = request.user.id;

    await callProcedure(
      `BEGIN sp_deactivate_product(:product_id, :admin_id); END;`,
      { product_id: productId, admin_id: adminId }
    );

    return ok({ message: 'Product deactivated' });
  } catch (err) {
    console.error('PATCH deactivate product:', err);
    return serverError('Something went wrong');
  }
}

export const PATCH = requireAuth(patchHandler, ['admin']);
