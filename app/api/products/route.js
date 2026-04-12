import oracledb from 'oracledb';
import { executeQuery, getConnection } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';
import { requireAuth } from '@/lib/middleware';
import {
  ok,
  created,
  badRequest,
  serverError,
} from '@/lib/response';

function parsePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/** Safe Oracle Text query: alphanumeric tokens joined with AND (uses CONTEXT indexes). */
function buildOracleTextQuery(raw) {
  const tokens = String(raw).match(/[a-zA-Z0-9]+/g);
  if (!tokens || tokens.length === 0) return null;
  return tokens.slice(0, 12).join(' AND ');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const search = searchParams.get('search');
    const { page, limit, offset } = parsePagination(searchParams);
    const includeInactive =
      searchParams.get('include_inactive') === '1' && getAdminFromRequest(request);

    const conditions = [];
    if (!includeInactive) {
      conditions.push('p.is_active = 1');
    }
    const binds = {};

    if (categoryId) {
      binds.category_id = Number(categoryId);
      conditions.push('p.category_id = :category_id');
    }
    if (minPrice !== null && minPrice !== '') {
      binds.min_price = Number(minPrice);
      conditions.push('p.price >= :min_price');
    }
    if (maxPrice !== null && maxPrice !== '') {
      binds.max_price = Number(maxPrice);
      conditions.push('p.price <= :max_price');
    }
    if (search) {
      const useOracleText = process.env.ORACLE_TEXT_SEARCH === 'true';
      const qtxt = useOracleText ? buildOracleTextQuery(search) : null;
      if (useOracleText && qtxt) {
        binds.qtxt = qtxt;
        conditions.push(
          '(CONTAINS(p.product_name, :qtxt) > 0 OR (p.description IS NOT NULL AND CONTAINS(p.description, :qtxt) > 0))'
        );
      } else {
        binds.search = `%${search}%`;
        conditions.push(
          '(LOWER(p.product_name) LIKE LOWER(:search) OR LOWER(NVL(p.description, \' \')) LIKE LOWER(:search))'
        );
      }
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await executeQuery(
      `SELECT COUNT(*) AS "cnt"
       FROM products p
       JOIN categories c ON c.category_id = p.category_id
       ${whereSql}`,
      binds
    );
    const total = Number(countRes.rows?.[0]?.cnt ?? countRes.rows?.[0]?.CNT ?? 0);

    binds.limit = limit;
    binds.offset = offset;

    const dataRes = await executeQuery(
      `SELECT
         p.product_id AS "product_id",
         p.product_name AS "product_name",
         p.description AS "description",
         p.image_url AS "image_url",
         p.price AS "price",
         p.stock_quantity AS "stock_quantity",
         p.category_id AS "category_id",
         p.is_active AS "is_active",
         p.created_at AS "created_at",
         c.category_name AS "category_name"
       FROM products p
       JOIN categories c ON c.category_id = p.category_id
       ${whereSql}
       ORDER BY p.product_id
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      binds
    );

    const rows = dataRes.rows || [];
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return ok({
      data: rows,
      total,
      page,
      totalPages,
    });
  } catch (err) {
    console.error('GET /products:', err);
    return serverError('Something went wrong');
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { product_name, description, image_url, price, stock_quantity, category_id } =
      body || {};

    if (!product_name || price === undefined || stock_quantity === undefined || !category_id) {
      return badRequest('product_name, price, stock_quantity, and category_id are required');
    }

    const p = Number(price);
    const s = Number(stock_quantity);
    if (Number.isNaN(p) || p <= 0) return badRequest('price must be greater than 0');
    if (Number.isNaN(s) || s < 0) return badRequest('stock_quantity must be >= 0');

    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `INSERT INTO products (
          product_id, product_name, description, image_url, price, stock_quantity, category_id, is_active, created_at
        ) VALUES (
          seq_product_id.NEXTVAL, :product_name, :description, :image_url, :price, :stock_quantity, :category_id, 1, SYSDATE
        ) RETURNING product_id INTO :product_id`,
        {
          product_name,
          description: description ?? null,
          image_url: image_url ?? null,
          price: p,
          stock_quantity: s,
          category_id: Number(category_id),
          product_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        },
        {
          autoCommit: true,
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        }
      );
      const out = result.outBinds?.product_id;
      const product_id = Array.isArray(out) ? out[0] : out;
      return created({ product_id });
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch {}
      }
    }
  } catch (err) {
    console.error('POST /products:', err);
    return serverError('Something went wrong');
  }
}

export const POST = requireAuth(postHandler, ['admin']);
