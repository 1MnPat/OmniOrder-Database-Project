'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { api, ApiError } from '@/lib/api-client';

export default function AccountPage() {
  const { isCustomer, ready } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready || !isCustomer) {
      setLoading(false);
      return;
    }
    api('/api/customers/me')
      .then((data) => {
        const c = data.customer;
        setCustomer(c);
        setForm({
          shipping_address: c.shipping_address || '',
          city: c.city || '',
          postal_code: c.postal_code || '',
          country: c.country || '',
          phone: c.phone || '',
          password: '',
        });
      })
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [ready, isCustomer]);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    setError('');
    setSaving(true);
    const body = {};
    if (form.shipping_address !== undefined)
      body.shipping_address = form.shipping_address;
    if (form.city !== undefined) body.city = form.city;
    if (form.postal_code !== undefined) body.postal_code = form.postal_code;
    if (form.country !== undefined) body.country = form.country;
    if (form.phone !== undefined) body.phone = form.phone;
    if (form.password && form.password.length > 0) body.password = form.password;

    try {
      await api('/api/customers/me', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      setMsg('Profile updated.');
      setField('password', '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div className="h-64 animate-pulse rounded-card bg-surface-container" />
      </div>
    );
  }

  if (!isCustomer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="mt-4 text-on-surface-variant">
          Customer accounts only. Admins can use the admin console.
        </p>
        <Link href="/login?next=/account" className="btn-primary mt-8 inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Account</h1>
      <p className="mt-2 text-on-surface-variant">
        {customer?.email}
      </p>

      <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4">
        {error && (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        {msg && (
          <div className="rounded-xl bg-tertiary/10 px-4 py-3 text-sm text-tertiary">
            {msg}
          </div>
        )}
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-on-surface-variant">
            Phone
          </span>
          <input
            className="input-field"
            value={form.phone || ''}
            onChange={(e) => setField('phone', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-on-surface-variant">
            Shipping address
          </span>
          <input
            className="input-field"
            value={form.shipping_address || ''}
            onChange={(e) => setField('shipping_address', e.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-on-surface-variant">
              City
            </span>
            <input
              className="input-field"
              value={form.city || ''}
              onChange={(e) => setField('city', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-on-surface-variant">
              Postal code
            </span>
            <input
              className="input-field"
              value={form.postal_code || ''}
              onChange={(e) => setField('postal_code', e.target.value)}
            />
          </label>
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-on-surface-variant">
            Country
          </span>
          <input
            className="input-field"
            value={form.country || ''}
            onChange={(e) => setField('country', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-on-surface-variant">
            New password (optional)
          </span>
          <input
            className="input-field"
            type="password"
            autoComplete="new-password"
            value={form.password || ''}
            onChange={(e) => setField('password', e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary mt-4 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
