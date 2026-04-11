import { callProcedure, executeQuery } from '@/lib/db';
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

function isStockError(err) {
  const code = err?.errorNum;
  if (code === 20001) return true;
  const msg = String(err?.message || '');
  if (msg.includes('ORA-20001')) return true;
  if (msg.includes('Insufficient stock')) return true;
  return false;
}

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const { page, limit, offset } = parsePagination(searchParams);

    const role = request.user.role;
    const customerId = request.user.id;

    const conditions = [];
    /** WHERE-clause binds only (COUNT query must not receive :offset / :limit — Thin mode NJS-098). */
    const filterBinds = {};

    if (role === 'customer') {
      filterBinds.customer_id = customerId;
      conditions.push('o.customer_id = :customer_id');
    }

    if (status) {
      filterBinds.status_filter = status;
      conditions.push(
        `EXISTS (
          SELECT 1 FROM (
            SELECT h.order_id, h.status_code,
                   ROW_NUMBER() OVER (PARTITION BY h.order_id ORDER BY h.update_timestamp DESC) rn
            FROM order_status_history h
          ) x
          WHERE x.order_id = o.order_id AND x.rn = 1 AND x.status_code = :status_filter
        )`
      );
    }

    if (dateFrom) {
      filterBinds.date_from = new Date(`${dateFrom}T00:00:00.000Z`);
      conditions.push('o.order_date >= :date_from');
    }
    if (dateTo) {
      filterBinds.date_to = new Date(`${dateTo}T23:59:59.999Z`);
      conditions.push('o.order_date <= :date_to');
    }

    const whereExtra = conditions.length ? `AND ${conditions.join(' AND ')}` : '';

    const countRes = await executeQuery(
      `SELECT COUNT(*) AS "cnt" FROM orders o WHERE 1=1 ${whereExtra}`,
      filterBinds
    );
    const total = Number(countRes.rows?.[0]?.cnt ?? countRes.rows?.[0]?.CNT ?? 0);

    const baseSelect =
      role === 'admin'
        ? `SELECT
             o.order_id AS "order_id",
             o.customer_id AS "customer_id",
             o.order_date AS "order_date",
             o.total_amount AS "total_amount",
             c.first_name AS "customer_first_name",
             c.last_name AS "customer_last_name",
             (
               SELECT h.status_code
               FROM (
                 SELECT h2.order_id, h2.status_code,
                        ROW_NUMBER() OVER (PARTITION BY h2.order_id ORDER BY h2.update_timestamp DESC) rn
                 FROM order_status_history h2
                 WHERE h2.order_id = o.order_id
               ) h
               WHERE h.rn = 1
             ) AS "status_code"
           FROM orders o
           JOIN customers c ON c.customer_id = o.customer_id
           WHERE 1=1 ${whereExtra}
           ORDER BY o.order_id DESC
           OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`
        : `SELECT
             o.order_id AS "order_id",
             o.customer_id AS "customer_id",
             o.order_date AS "order_date",
             o.total_amount AS "total_amount",
             (
               SELECT h.status_code
               FROM (
                 SELECT h2.order_id, h2.status_code,
                        ROW_NUMBER() OVER (PARTITION BY h2.order_id ORDER BY h2.update_timestamp DESC) rn
                 FROM order_status_history h2
                 WHERE h2.order_id = o.order_id
               ) h
               WHERE h.rn = 1
             ) AS "status_code"
           FROM orders o
           WHERE 1=1 ${whereExtra}
           ORDER BY o.order_id DESC
           OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;

    const pageBinds = { ...filterBinds, offset, limit };
    const dataRes = await executeQuery(baseSelect, pageBinds);
    const rows = dataRes.rows || [];
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return ok({
      data: rows,
      total,
      page,
      totalPages,
    });
  } catch (err) {
    console.error('GET /orders:', err);
    return serverError('Something went wrong');
  }
}

export const GET = requireAuth(getHandler, ['customer', 'admin']);

async function postHandler(request) {
  try {
    const body = await request.json();
    const { items } = body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return badRequest('items array is required');
    }

    const customerId = request.user.id;

    const beforeRes = await executeQuery(
      `SELECT NVL(MAX(order_id), 0) AS "max_id" FROM orders WHERE customer_id = :customer_id`,
      { customer_id: customerId }
    );
    const beforeMax = Number(beforeRes.rows?.[0]?.max_id ?? beforeRes.rows?.[0]?.MAX_ID ?? 0);

    for (const item of items) {
      const { product_id, quantity } = item || {};
      if (product_id === undefined || quantity === undefined) {
        return badRequest('Each item needs product_id and quantity');
      }
      const q = Number(quantity);
      if (Number.isNaN(q) || q <= 0) {
        return badRequest('Invalid quantity');
      }

      try {
        await callProcedure(
          `BEGIN sp_place_order(:customer_id, :product_id, :quantity); END;`,
          {
            customer_id: customerId,
            product_id: Number(product_id),
            quantity: q,
          }
        );
      } catch (e) {
        if (isStockError(e)) {
          return badRequest('Insufficient stock for one or more items');
        }
        throw e;
      }
    }

    const lastRes = await executeQuery(
      `SELECT MAX(order_id) AS "order_id" FROM orders WHERE customer_id = :customer_id AND order_id > :before_max`,
      { customer_id: customerId, before_max: beforeMax }
    );
    const order_id = lastRes.rows?.[0]?.order_id ?? null;

    return created({
      order_id,
      message: 'Order placed successfully',
    });
  } catch (err) {
    console.error('POST /orders:', err);
    return serverError('Something went wrong');
  }
}

export const POST = requireAuth(postHandler, ['customer']);
