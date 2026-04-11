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

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

function canCustomerCancel(statusCode) {
  if (!statusCode) return true;
  return !['CANCELLED', 'DELIVERED'].includes(String(statusCode));
}

export default function OrdersPage() {
  const { isCustomer, isAdmin, ready } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  function loadOrders() {
    return api('/api/orders?limit=50')
      .then((data) => setOrders(data.data || []))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load orders')
      );
  }

  useEffect(() => {
    if (!ready || (!isCustomer && !isAdmin)) {
      setLoading(false);
      return;
    }
    loadOrders().finally(() => setLoading(false));
  }, [ready, isCustomer, isAdmin]);

  async function handleCancel(e, orderId) {
    e.preventDefault();
    e.stopPropagation();
    if (
      !confirm(
        'Cancel this order? This cannot be undone if the store policy allows it.'
      )
    ) {
      return;
    }
    setCancellingId(orderId);
    setError('');
    try {
      await api(`/api/orders/${orderId}/cancel`, { method: 'POST', body: '{}' });
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not cancel order'
      );
    } finally {
      setCancellingId(null);
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <div className="h-48 animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  if (!isCustomer && !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="mt-4 text-on-surface-variant">Sign in to view orders.</p>
        <Link href="/login?next=/orders" className="btn-primary mt-8 inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Orders</h1>
      <p className="mt-2 text-on-surface-variant">
        {isAdmin ? 'All store orders' : 'Your orders'}
      </p>

      {error && (
        <div className="mt-8 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="mt-10 space-y-4">
        {orders.length === 0 && !error ? (
          <p className="rounded-card bg-surface-container-low p-12 text-center text-on-surface-variant">
            No orders yet.
          </p>
        ) : (
          orders.map((o) => (
            <div
              key={o.order_id}
              className="flex flex-col gap-4 rounded-card bg-surface-container-lowest p-6 shadow-ambient transition hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                href={`/orders/${o.order_id}`}
                className="min-w-0 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <p className="font-semibold text-on-surface">
                  Order #{o.order_id}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {formatDate(o.order_date)}
                </p>
                {isAdmin && o.customer_first_name && (
                  <p className="text-sm text-on-surface-variant">
                    {o.customer_first_name} {o.customer_last_name}
                  </p>
                )}
              </Link>
              <div className="flex flex-col items-stretch gap-3 sm:items-end">
                <div className="text-left sm:text-right">
                  <p className="font-bold">{formatMoney(o.total_amount)}</p>
                  {o.status_code && (
                    <p className="text-sm text-primary">{o.status_code}</p>
                  )}
                </div>
                {isCustomer &&
                  canCustomerCancel(o.status_code) && (
                    <button
                      type="button"
                      onClick={(e) => handleCancel(e, o.order_id)}
                      disabled={cancellingId === o.order_id}
                      className="rounded-xl border border-error/30 bg-error/5 px-4 py-2 text-sm font-medium text-error transition hover:bg-error/10 disabled:opacity-60"
                    >
                      {cancellingId === o.order_id
                        ? 'Cancelling…'
                        : 'Cancel order'}
                    </button>
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
