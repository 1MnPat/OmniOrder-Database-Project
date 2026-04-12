import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { ok, serverError } from '@/lib/response';

function parsePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/** Oracle may return quoted aliases in mixed case; normalize for JSON clients. */
function stripPassword(row) {
  if (!row || typeof row !== 'object') return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[k.toLowerCase()] = v;
  }
  delete out.password;
  return out;
}

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const isActive = searchParams.get('is_active');
    const { page, limit, offset } = parsePagination(searchParams);

    const conditions = [];
    const countBinds = {};

    if (search) {
      countBinds.search = `%${search}%`;
      conditions.push(
        `(LOWER(c.email) LIKE LOWER(:search) OR LOWER(c.first_name) LIKE LOWER(:search) OR LOWER(c.last_name) LIKE LOWER(:search))`
      );
    }
    if (isActive !== null && isActive !== '') {
      countBinds.is_active = Number(isActive);
      conditions.push('c.is_active = :is_active');
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // COUNT must not bind :offset / :limit — only WHERE placeholders (Oracle driver mismatch otherwise).
    const countRes = await executeQuery(
      `SELECT COUNT(*) AS "cnt" FROM customers c ${whereSql}`,
      countBinds
    );
    const total = Number(countRes.rows?.[0]?.cnt ?? countRes.rows?.[0]?.CNT ?? 0);

    const dataBinds = { ...countBinds, offset, limit };

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
      dataBinds
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
