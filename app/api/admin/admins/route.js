import bcrypt from 'bcryptjs';
import { callProcedure } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { badRequest, created, serverError } from '@/lib/response';

async function postHandler(request) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name } = body || {};

    if (!email || !password || !first_name || !last_name) {
      return badRequest('email, password, first_name, and last_name are required');
    }

    const hashed = await bcrypt.hash(password, 10);

    await callProcedure(
      `BEGIN sp_create_admin(:email, :password, :first_name, :last_name); END;`,
      {
        email,
        password: hashed,
        first_name,
        last_name,
      }
    );

    return created({ message: 'Admin created successfully' });
  } catch (err) {
    console.error('POST /admin/admins:', err);
    return serverError('Something went wrong');
  }
}

export const POST = requireAuth(postHandler, ['admin']);
