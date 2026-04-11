'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api-client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Sign in failed. Try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-card bg-surface-container-lowest p-8 shadow-ambient sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Welcome back to Nexus Commerce.
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          {error && (
            <div
              className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {error}
            </div>
          )}
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Email
            </span>
            <input
              className="input-field"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Password
            </span>
            <input
              className="input-field"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 w-full disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          No account?{' '}
          <Link href="/register" className="font-semibold text-primary">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-surface-container" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
