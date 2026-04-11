import oracledb from 'oracledb';
import { executeQuery, getConnection } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { ok, created, badRequest, serverError } from '@/lib/response';

function parsePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePagination(searchParams);

    const countRes = await executeQuery(
      `SELECT COUNT(*) AS "cnt" FROM categories`
    );
    const total = Number(countRes.rows?.[0]?.cnt ?? countRes.rows?.[0]?.CNT ?? 0);

    const dataRes = await executeQuery(
      `SELECT category_id AS "category_id", category_name AS "category_name"
       FROM categories
       ORDER BY category_id
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { offset, limit }
    );

    const categories = dataRes.rows || [];
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return ok({ categories, total, page, totalPages });
  } catch (err) {
    console.error('GET /categories:', err);
    return serverError('Something went wrong');
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { category_name } = body || {};
    if (!category_name || String(category_name).trim() === '') {
      return badRequest('category_name is required');
    }

    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `INSERT INTO categories (category_id, category_name)
         VALUES (seq_category_id.NEXTVAL, :category_name)
         RETURNING category_id INTO :category_id`,
        {
          category_name: String(category_name).trim(),
          category_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        },
        { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const out = result.outBinds?.category_id;
      const category_id = Array.isArray(out) ? out[0] : out;
      return created({ category_id });
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch {}
      }
    }
  } catch (err) {
    console.error('POST /categories:', err);
    return serverError('Something went wrong');
  }
}

export const POST = requireAuth(postHandler, ['admin']);
