'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    shipping_address: '',
    city: '',
    postal_code: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/login');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-card bg-surface-container-lowest p-8 shadow-ambient sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Join Nexus Commerce to place orders and track shipments.
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          {error && (
            <div
              className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium text-on-surface-variant">
                First name
              </span>
              <input
                className="input-field"
                value={form.first_name}
                onChange={(e) => setField('first_name', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium text-on-surface-variant">
                Last name
              </span>
              <input
                className="input-field"
                value={form.last_name}
                onChange={(e) => setField('last_name', e.target.value)}
                required
              />
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-on-surface-variant">
              Email
            </span>
            <input
              className="input-field"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-on-surface-variant">
              Password
            </span>
            <input
              className="input-field"
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-on-surface-variant">
              Phone
            </span>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-on-surface-variant">
              Shipping address
            </span>
            <input
              className="input-field"
              value={form.shipping_address}
              onChange={(e) => setField('shipping_address', e.target.value)}
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium text-on-surface-variant">
                City
              </span>
              <input
                className="input-field"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium text-on-surface-variant">
                Postal code
              </span>
              <input
                className="input-field"
                value={form.postal_code}
                onChange={(e) => setField('postal_code', e.target.value)}
                required
              />
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-on-surface-variant">
              Country
            </span>
            <input
              className="input-field"
              value={form.country}
              onChange={(e) => setField('country', e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-4 w-full disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
