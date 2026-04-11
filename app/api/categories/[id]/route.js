import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { ok, conflict, serverError } from '@/lib/response';

async function resolveParams(params) {
  if (params && typeof params.then === 'function') return await params;
  return params;
}

async function deleteHandler(request, context) {
  try {
    const { id } = await resolveParams(context.params);
    const cid = Number(id);

    const cntRes = await executeQuery(
      `SELECT COUNT(*) AS "cnt" FROM products WHERE category_id = :id`,
      { id: cid }
    );
    const cnt = Number(cntRes.rows?.[0]?.cnt ?? cntRes.rows?.[0]?.CNT ?? 0);
    if (cnt > 0) {
      return conflict('Cannot delete category with existing products');
    }

    await executeQuery(`DELETE FROM categories WHERE category_id = :id`, { id: cid });

    return ok({ message: 'Category deleted' });
  } catch (err) {
    console.error('DELETE /categories/[id]:', err);
    return serverError('Something went wrong');
  }
}

export const DELETE = requireAuth(deleteHandler, ['admin']);
