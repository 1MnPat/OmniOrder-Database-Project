'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { api, ApiError } from '@/lib/api-client';

function formatMoney(n) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(n) || 0);
}

function canCustomerCancel(statusCode) {
  if (!statusCode) return true;
  return !['CANCELLED', 'DELIVERED'].includes(String(statusCode));
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { ready, isCustomer, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');

  function loadOrder() {
    if (!id) return Promise.resolve();
    return api(`/api/orders/${id}`).then(setData);
  }

  useEffect(() => {
    if (!ready || !id || (!isCustomer && !isAdmin)) {
      setLoading(false);
      return;
    }
    setError('');
    loadOrder()
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Not found')
      )
      .finally(() => setLoading(false));
  }, [ready, id, isCustomer, isAdmin]);

  async function handleCancelOrder() {
    if (!id) return;
    if (
      !confirm(
        'Cancel this order? Status will be set to CANCELLED if allowed.'
      )
    ) {
      return;
    }
    setCancelMsg('');
    setCancelling(true);
    try {
      await api(`/api/orders/${id}/cancel`, { method: 'POST', body: '{}' });
      setCancelMsg('Order cancelled.');
      await loadOrder();
    } catch (err) {
      setCancelMsg(
        err instanceof ApiError ? err.message : 'Could not cancel order'
      );
    } finally {
      setCancelling(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="h-64 animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  if (!isCustomer && !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Link href="/login" className="text-primary">
          Sign in
        </Link>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-error">{error || 'Order not found'}</p>
        <Link href="/orders" className="mt-6 inline-block text-primary">
          ← Orders
        </Link>
      </div>
    );
  }

  const { order, items, statusHistory } = data;
  const latestStatus =
    statusHistory?.length > 0
      ? statusHistory[statusHistory.length - 1].status_code
      : null;
  const showCancel =
    isCustomer && canCustomerCancel(latestStatus);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <Link href="/orders" className="text-sm font-medium text-primary">
        ← All orders
      </Link>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Order #{order?.order_id}
          </h1>
          <p className="mt-2 text-on-surface-variant">
            Total {formatMoney(order?.total_amount)}
          </p>
        </div>
        {showCancel && (
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="rounded-xl border border-error/30 bg-error/5 px-5 py-2.5 text-sm font-semibold text-error transition hover:bg-error/10 disabled:opacity-60"
            >
              {cancelling ? 'Cancelling…' : 'Cancel order'}
            </button>
            {cancelMsg && (
              <p
                className={`text-sm ${cancelMsg.includes('cancelled') ? 'text-tertiary' : 'text-error'}`}
                role="status"
              >
                {cancelMsg}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 rounded-card bg-surface-container-low p-8">
        <h2 className="text-lg font-semibold">Items</h2>
        <ul className="mt-4 space-y-3">
          {(items || []).map((line) => (
            <li
              key={line.order_item_id}
              className="flex justify-between text-sm"
            >
              <span>
                {line.product_name} × {line.quantity}
              </span>
              <span>{formatMoney(line.unit_price * line.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-card bg-surface-container-low p-8">
        <h2 className="text-lg font-semibold">Status history</h2>
        <ul className="mt-4 space-y-2">
          {(statusHistory || []).map((h) => (
            <li key={h.history_id} className="text-sm text-on-surface-variant">
              <span className="font-medium text-on-surface">
                {h.status_code}
              </span>{' '}
              — {h.update_timestamp ? String(h.update_timestamp) : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
