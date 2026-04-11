import oracledb from 'oracledb';
import { executeQuery, getConnection } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { ok, badRequest, notFound, serverError } from '@/lib/response';

async function resolveParams(params) {
  if (params && typeof params.then === 'function') return await params;
  return params;
}

export async function GET(request, context) {
  try {
    const { id } = await resolveParams(context.params);
    const pid = Number(id);
    if (Number.isNaN(pid)) return notFound('Product not found');

    const res = await executeQuery(
      `SELECT
         p.product_id AS "product_id",
         p.product_name AS "product_name",
         p.description AS "description",
         p.price AS "price",
         p.stock_quantity AS "stock_quantity",
         p.category_id AS "category_id",
         p.is_active AS "is_active",
         p.created_at AS "created_at",
         c.category_name AS "category_name"
       FROM products p
       JOIN categories c ON c.category_id = p.category_id
       WHERE p.product_id = :id AND p.is_active = 1`,
      { id: pid }
    );

    const row = res.rows?.[0];
    if (!row) return notFound('Product not found');

    return ok(row);
  } catch (err) {
    console.error('GET /products/[id]:', err);
    return serverError('Something went wrong');
  }
}

async function putHandler(request, context) {
  try {
    const { id } = await resolveParams(context.params);
    const pid = Number(id);
    if (Number.isNaN(pid)) return notFound('Product not found');

    const body = await request.json();
    const allowed = [
      'product_name',
      'description',
      'price',
      'stock_quantity',
      'category_id',
      'is_active',
    ];
    const updates = {};
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, k)) updates[k] = body[k];
    }

    if (Object.keys(updates).length === 0) {
      return badRequest('No fields to update');
    }

    if (updates.price !== undefined) {
      const p = Number(updates.price);
      if (Number.isNaN(p) || p <= 0) return badRequest('price must be greater than 0');
      updates.price = p;
    }
    if (updates.stock_quantity !== undefined) {
      const s = Number(updates.stock_quantity);
      if (Number.isNaN(s) || s < 0) return badRequest('stock_quantity must be >= 0');
      updates.stock_quantity = s;
    }
    if (updates.category_id !== undefined) {
      updates.category_id = Number(updates.category_id);
    }

    const hasPrice = Object.prototype.hasOwnProperty.call(updates, 'price');
    const adminId = request.user.id;

    const setParts = [];
    const binds = { id: pid };

    if (updates.product_name !== undefined) {
      binds.product_name = updates.product_name;
      setParts.push('product_name = :product_name');
    }
    if (updates.description !== undefined) {
      binds.description = updates.description;
      setParts.push('description = :description');
    }
    if (updates.stock_quantity !== undefined) {
      binds.stock_quantity = updates.stock_quantity;
      setParts.push('stock_quantity = :stock_quantity');
    }
    if (updates.category_id !== undefined) {
      binds.category_id = updates.category_id;
      setParts.push('category_id = :category_id');
    }
    if (updates.is_active !== undefined) {
      binds.is_active = updates.is_active;
      setParts.push('is_active = :is_active');
    }
    if (hasPrice) {
      binds.price = updates.price;
      setParts.push('price = :price');
    }

    const setSql = setParts.join(', ');

    if (hasPrice) {
      let conn;
      try {
        conn = await getConnection();
        await conn.execute(
          `BEGIN pkg_nc_audit_ctx.g_admin_id := :admin_id; END;`,
          { admin_id: adminId },
          { autoCommit: false }
        );
        await conn.execute(
          `UPDATE products SET ${setSql} WHERE product_id = :id`,
          binds,
          { autoCommit: false, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        await conn.commit();
      } catch (e) {
        if (conn) {
          try {
            await conn.rollback();
          } catch {}
        }
        throw e;
      } finally {
        if (conn) {
          try {
            await conn.close();
          } catch {}
        }
      }
    } else {
      await executeQuery(
        `UPDATE products SET ${setSql} WHERE product_id = :id`,
        binds
      );
    }

    return ok({ message: 'Product updated' });
  } catch (err) {
    console.error('PUT /products/[id]:', err);
    return serverError('Something went wrong');
  }
}

export const PUT = requireAuth(putHandler, ['admin']);
