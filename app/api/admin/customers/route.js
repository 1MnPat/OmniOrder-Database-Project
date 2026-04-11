import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { ok, serverError } from '@/lib/response';

function parsePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function stripPassword(row) {
  if (!row) return row;
  const out = { ...row };
  delete out.password;
  delete out.PASSWORD;
  return out;
}

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const isActive = searchParams.get('is_active');
    const { page, limit, offset } = parsePagination(searchParams);

    const conditions = [];
    const binds = { offset, limit };

    if (search) {
      binds.search = `%${search}%`;
      conditions.push(
        `(LOWER(c.email) LIKE LOWER(:search) OR LOWER(c.first_name) LIKE LOWER(:search) OR LOWER(c.last_name) LIKE LOWER(:search))`
      );
    }
    if (isActive !== null && isActive !== '') {
      binds.is_active = Number(isActive);
      conditions.push('c.is_active = :is_active');
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await executeQuery(
      `SELECT COUNT(*) AS "cnt" FROM customers c ${whereSql}`,
      binds
    );
    const total = Number(countRes.rows?.[0]?.cnt ?? countRes.rows?.[0]?.CNT ?? 0);

    const dataRes = await executeQuery(
      `SELECT
         c.customer_id AS "customer_id",
         c.email AS "email",
         c.password AS "password",
         c.first_name AS "first_name",
         c.last_name AS "last_name",
         c.phone AS "phone",
         c.shipping_address AS "shipping_address",
         c.city AS "city",
         c.postal_code AS "postal_code",
         c.country AS "country",
         c.created_at AS "created_at",
         c.is_active AS "is_active"
       FROM customers c
       ${whereSql}
       ORDER BY c.customer_id
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      binds
    );

    const customers = (dataRes.rows || []).map(stripPassword);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return ok({
      customers,
      total,
      page,
      totalPages,
    });
  } catch (err) {
    console.error('GET /admin/customers:', err);
    return serverError('Something went wrong');
  }
}

export const GET = requireAuth(getHandler, ['admin']);
