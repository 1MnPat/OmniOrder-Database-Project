import bcrypt from 'bcryptjs';
import { executeQuery } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { ok, unauthorizedResponse, serverError } from '@/lib/response';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return unauthorizedResponse('Invalid credentials');
    }

    const adminRes = await executeQuery(
      `SELECT admin_id AS "id",
              email AS "email",
              password AS "password",
              first_name AS "first_name",
              last_name AS "last_name"
       FROM admins
       WHERE LOWER(email) = LOWER(:email) AND is_active = 1`,
      { email }
    );

    const adminRow = adminRes.rows?.[0];
    if (adminRow) {
      const match = await bcrypt.compare(password, adminRow.password);
      if (!match) return unauthorizedResponse('Invalid credentials');
      const token = signToken({
        id: adminRow.id,
        role: 'admin',
        email: adminRow.email,
      });
      return ok({
        token,
        role: 'admin',
        name: adminRow.first_name,
      });
    }

    const custRes = await executeQuery(
      `SELECT customer_id AS "id",
              email AS "email",
              password AS "password",
              first_name AS "first_name",
              last_name AS "last_name"
       FROM customers
       WHERE LOWER(email) = LOWER(:email) AND is_active = 1`,
      { email }
    );

    const custRow = custRes.rows?.[0];
    if (!custRow) {
      return unauthorizedResponse('Invalid credentials');
    }

    const match = await bcrypt.compare(password, custRow.password);
    if (!match) return unauthorizedResponse('Invalid credentials');

    const token = signToken({
      id: custRow.id,
      role: 'customer',
      email: custRow.email,
    });

    return ok({
      token,
      role: 'customer',
      name: custRow.first_name,
    });
  } catch (err) {
    console.error('login:', err);
    return serverError('Something went wrong');
  }
}
