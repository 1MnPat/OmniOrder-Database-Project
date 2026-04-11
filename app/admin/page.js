'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { api, ApiError } from '@/lib/api-client';

function formatMoney(n) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(n) || 0);
}

export default function AdminPage() {
  const { isAdmin, ready } = useAuth();
  const [dash, setDash] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !isAdmin) {
      setLoading(false);
      return;
    }
    api('/api/admin/dashboard')
      .then(setDash)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load')
      )
      .finally(() => setLoading(false));
  }, [ready, isAdmin]);

  if (!ready || loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="h-40 animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-4 text-on-surface-variant">Administrator access only.</p>
        <Link href="/login?next=/admin" className="btn-primary mt-8 inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Admin dashboard</h1>
      <p className="mt-2 text-on-surface-variant">
        Live metrics from your Nexus Commerce API.
      </p>

      {error && (
        <div className="mt-8 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {dash && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-card bg-surface-container-low p-6 shadow-ambient">
            <p className="text-sm text-on-surface-variant">Revenue</p>
            <p className="mt-2 text-3xl font-bold">
              {formatMoney(dash.revenue)}
            </p>
          </div>
          {(dash.ordersByStatus || []).map((row) => (
            <div
              key={row.status_code}
              className="rounded-card bg-surface-container-low p-6 shadow-ambient"
            >
              <p className="text-sm text-on-surface-variant">
                {row.status_code}
              </p>
              <p className="mt-2 text-3xl font-bold">
                {row.count ?? row.COUNT}
              </p>
            </div>
          ))}
        </div>
      )}

      {dash?.topProducts && (
        <div className="mt-12">
          <h2 className="text-xl font-bold">Top products</h2>
          <ul className="mt-4 space-y-2 rounded-card bg-surface-container-low p-6">
            {dash.topProducts.map((p) => (
              <li key={p.product_id} className="flex justify-between text-sm">
                <span>{p.product_name}</span>
                <span className="text-on-surface-variant">
                  Sold: {p.total_sold}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dash?.lowStock && dash.lowStock.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Low stock (&lt; 10)</h2>
          <ul className="mt-4 space-y-2 rounded-card bg-error/5 p-6">
            {dash.lowStock.map((p) => (
              <li key={p.product_id} className="flex justify-between text-sm">
                <span>{p.product_name}</span>
                <span className="text-error">{p.stock_quantity} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
