import bcrypt from 'bcryptjs';
import { callProcedure } from '@/lib/db';
import { badRequest, conflict, created, serverError } from '@/lib/response';

function isDupEmailError(err) {
  const code = err?.errorNum;
  if (code === 1) return true;
  if (code === 20002) return true;
  const msg = String(err?.message || '');
  if (msg.includes('ORA-00001')) return true;
  if (msg.includes('ORA-20002')) return true;
  return false;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      shipping_address,
      city,
      postal_code,
      country,
    } = body || {};

    if (
      !email ||
      !password ||
      !first_name ||
      !last_name ||
      !phone ||
      !shipping_address ||
      !city ||
      !postal_code ||
      !country
    ) {
      return badRequest('All fields are required');
    }

    const hashed = await bcrypt.hash(password, 10);

    await callProcedure(
      `BEGIN sp_register_customer(
        :email,
        :password,
        :first_name,
        :last_name,
        :phone,
        :address,
        :city,
        :postal_code,
        :country
      ); END;`,
      {
        email,
        password: hashed,
        first_name,
        last_name,
        phone,
        address: shipping_address,
        city,
        postal_code,
        country,
      }
    );

    return created({ message: 'Account created successfully' });
  } catch (err) {
    console.error('register:', err);
    if (isDupEmailError(err)) {
      return conflict('Email already registered');
    }
    return serverError('Something went wrong');
  }
}
