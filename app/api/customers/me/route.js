import bcrypt from 'bcryptjs';
import { executeQuery } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { ok, serverError } from '@/lib/response';

function stripPassword(row) {
  if (!row) return row;
  const out = { ...row };
  delete out.password;
  delete out.PASSWORD;
  return out;
}

async function getHandler(request) {
  try {
    const id = request.user.id;

    const res = await executeQuery(
      `SELECT
         customer_id AS "customer_id",
         email AS "email",
         password AS "password",
         first_name AS "first_name",
         last_name AS "last_name",
         phone AS "phone",
         shipping_address AS "shipping_address",
         city AS "city",
         postal_code AS "postal_code",
         country AS "country",
         created_at AS "created_at",
         is_active AS "is_active"
       FROM customers
       WHERE customer_id = :id`,
      { id }
    );

    const row = res.rows?.[0];
    if (!row) {
      return serverError('Something went wrong');
    }

    return ok({ customer: stripPassword(row) });
  } catch (err) {
    console.error('GET /customers/me:', err);
    return serverError('Something went wrong');
  }
}

export const GET = requireAuth(getHandler, ['customer']);

async function putHandler(request) {
  try {
    const id = request.user.id;
    const body = await request.json();
    const allowed = [
      'shipping_address',
      'city',
      'postal_code',
      'country',
      'phone',
      'password',
    ];
    const updates = {};
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, k)) updates[k] = body[k];
    }

    if (Object.keys(updates).length === 0) {
      return ok({ message: 'Nothing to update' });
    }

    const setParts = [];
    const binds = { id };

    if (updates.shipping_address !== undefined) {
      binds.shipping_address = updates.shipping_address;
      setParts.push('shipping_address = :shipping_address');
    }
    if (updates.city !== undefined) {
      binds.city = updates.city;
      setParts.push('city = :city');
    }
    if (updates.postal_code !== undefined) {
      binds.postal_code = updates.postal_code;
      setParts.push('postal_code = :postal_code');
    }
    if (updates.country !== undefined) {
      binds.country = updates.country;
      setParts.push('country = :country');
    }
    if (updates.phone !== undefined) {
      binds.phone = updates.phone;
      setParts.push('phone = :phone');
    }
    if (updates.password !== undefined) {
      binds.password = await bcrypt.hash(String(updates.password), 10);
      setParts.push('password = :password');
    }

    await executeQuery(
      `UPDATE customers SET ${setParts.join(', ')} WHERE customer_id = :id`,
      binds
    );

    return ok({ message: 'Profile updated' });
  } catch (err) {
    console.error('PUT /customers/me:', err);
    return serverError('Something went wrong');
  }
}

export const PUT = requireAuth(putHandler, ['customer']);
