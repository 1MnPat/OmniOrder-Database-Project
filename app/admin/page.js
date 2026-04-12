'use client';

import { useCallback, useEffect, useState } from 'react';
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
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(d);
  }
}

export default function AdminPage() {
  const { isAdmin, ready } = useAuth();
  const [dash, setDash] = useState(null);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerTotal, setCustomerTotal] = useState(0);
  const [customerSearch, setCustomerSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [productMsg, setProductMsg] = useState('');
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productForm, setProductForm] = useState({
    product_name: '',
    description: '',
    image_url: '',
    price: '',
    stock_quantity: '',
    category_id: '',
  });

  const [adminCatalog, setAdminCatalog] = useState([]);
  const [adminCatalogLoading, setAdminCatalogLoading] = useState(false);
  const [editProductId, setEditProductId] = useState('');
  const [editForm, setEditForm] = useState(null);
  const [editMsg, setEditMsg] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadDashboard = useCallback(() => {
    return api('/api/admin/dashboard')
      .then(setDash)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load')
      );
  }, []);

  const loadCategories = useCallback(() => {
    return api('/api/categories?limit=100')
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const loadAdminCatalog = useCallback(() => {
    setAdminCatalogLoading(true);
    return api('/api/products?limit=100&page=1&include_inactive=1')
      .then((data) => setAdminCatalog(data?.data ?? []))
      .catch(() => setAdminCatalog([]))
      .finally(() => setAdminCatalogLoading(false));
  }, []);

  const loadCustomers = useCallback((search) => {
    setCustomersLoading(true);
    const q = search?.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    return api(`/api/admin/customers?limit=100${q}`)
      .then((data) => {
        setCustomers(data?.customers ?? []);
        setCustomerTotal(data?.total ?? 0);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load customers')
      )
      .finally(() => setCustomersLoading(false));
  }, []);

  useEffect(() => {
    if (!ready || !isAdmin) {
      setLoading(false);
      return;
    }
    setError('');
    Promise.all([
      loadDashboard(),
      loadCategories(),
      loadCustomers(),
      loadAdminCatalog(),
    ]).finally(() => setLoading(false));
  }, [
    ready,
    isAdmin,
    loadDashboard,
    loadCategories,
    loadCustomers,
    loadAdminCatalog,
  ]);

  async function handleAddProduct(e) {
    e.preventDefault();
    setProductMsg('');
    const {
      product_name,
      description,
      image_url,
      price,
      stock_quantity,
      category_id,
    } = productForm;
    if (!product_name?.trim() || !category_id) {
      setProductMsg('Name and category are required.');
      return;
    }
    const p = Number(price);
    const s = Number(stock_quantity);
    if (Number.isNaN(p) || p <= 0) {
      setProductMsg('Enter a valid price greater than 0.');
      return;
    }
    if (Number.isNaN(s) || s < 0) {
      setProductMsg('Enter a valid stock quantity (0 or more).');
      return;
    }
    setProductSubmitting(true);
    try {
      await api('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          product_name: product_name.trim(),
          description: description?.trim() || null,
          image_url: image_url?.trim() || null,
          price: p,
          stock_quantity: s,
          category_id: Number(category_id),
        }),
      });
      setProductForm({
        product_name: '',
        description: '',
        image_url: '',
        price: '',
        stock_quantity: '',
        category_id: '',
      });
      setProductMsg('Product added successfully.');
      await Promise.all([loadDashboard(), loadAdminCatalog()]);
    } catch (err) {
      setProductMsg(
        err instanceof ApiError ? err.message : 'Could not create product.'
      );
    } finally {
      setProductSubmitting(false);
    }
  }

  function handleCustomerSearch(e) {
    e.preventDefault();
    loadCustomers(customerSearch);
  }

  function mapProductToEditForm(p) {
    return {
      product_id: p.product_id,
      product_name: p.product_name || '',
      description: p.description || '',
      image_url: p.image_url || '',
      price: p.price != null ? String(p.price) : '',
      stock_quantity: p.stock_quantity != null ? String(p.stock_quantity) : '',
      category_id: String(p.category_id ?? ''),
      is_active: Number(p.is_active) === 1,
    };
  }

  function handleEditProductSelect(e) {
    const id = e.target.value;
    setEditMsg('');
    setEditProductId(id);
    if (!id) {
      setEditForm(null);
      return;
    }
    const p = adminCatalog.find((x) => String(x.product_id) === id);
    if (p) setEditForm(mapProductToEditForm(p));
  }

  async function handleUpdateProduct(e) {
    e.preventDefault();
    setEditMsg('');
    if (!editForm?.product_id) {
      setEditMsg('Select a product to edit.');
      return;
    }
    const {
      product_name,
      description,
      image_url,
      price,
      stock_quantity,
      category_id,
      is_active,
    } = editForm;
    if (!product_name?.trim() || !category_id) {
      setEditMsg('Name and category are required.');
      return;
    }
    const p = Number(price);
    const s = Number(stock_quantity);
    if (Number.isNaN(p) || p <= 0) {
      setEditMsg('Enter a valid price greater than 0.');
      return;
    }
    if (Number.isNaN(s) || s < 0) {
      setEditMsg('Enter a valid stock quantity (0 or more).');
      return;
    }
    setEditSubmitting(true);
    try {
      await api(`/api/products/${editForm.product_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          product_name: product_name.trim(),
          description: description?.trim() || null,
          image_url: image_url?.trim() || null,
          price: p,
          stock_quantity: s,
          category_id: Number(category_id),
          is_active: is_active ? 1 : 0,
        }),
      });
      setEditMsg('Product updated successfully.');
      await Promise.all([loadDashboard(), loadAdminCatalog()]);
      const refreshed = await api(
        `/api/products/${editForm.product_id}`
      ).catch(() => null);
      if (refreshed) setEditForm(mapProductToEditForm(refreshed));
    } catch (err) {
      setEditMsg(
        err instanceof ApiError ? err.message : 'Could not update product.'
      );
    } finally {
      setEditSubmitting(false);
    }
  }

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
        Metrics, catalog, and customers.
      </p>

      {error && (
        <div className="mt-8 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {dash && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight">Add product</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          New listings are active immediately and appear in the public catalog.
        </p>
        <form
          onSubmit={handleAddProduct}
          className="mt-6 max-w-2xl space-y-4 rounded-card bg-surface-container-low p-6 shadow-ambient"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              Product name *
            </label>
            <input
              className="input-field w-full"
              value={productForm.product_name}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, product_name: e.target.value }))
              }
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              Description
            </label>
            <textarea
              className="input-field min-h-[88px] w-full resize-y"
              value={productForm.description}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              Image URL
            </label>
            <input
              type="url"
              className="input-field w-full"
              placeholder="https://…"
              value={productForm.image_url}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, image_url: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Price (USD) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="input-field w-full"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm((f) => ({ ...f, price: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                Stock quantity *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="input-field w-full"
                value={productForm.stock_quantity}
                onChange={(e) =>
                  setProductForm((f) => ({
                    ...f,
                    stock_quantity: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              Category *
            </label>
            <select
              className="input-field w-full"
              value={productForm.category_id}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, category_id: e.target.value }))
              }
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>
          {productMsg && (
            <p
              className={`text-sm ${productMsg.includes('success') ? 'text-tertiary' : 'text-error'}`}
              role="status"
            >
              {productMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={productSubmitting}
            className="btn-primary disabled:opacity-60"
          >
            {productSubmitting ? 'Saving…' : 'Add product'}
          </button>
        </form>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight">Edit product</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Update catalog fields. Price changes are recorded in the database audit
          log via trigger.
        </p>
        <div className="mt-6 max-w-2xl space-y-4 rounded-card bg-surface-container-low p-6 shadow-ambient">
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              Product
            </label>
            <select
              className="input-field w-full"
              value={editProductId}
              onChange={handleEditProductSelect}
            >
              <option value="">Select a product…</option>
              {adminCatalogLoading ? (
                <option value="" disabled>
                  Loading…
                </option>
              ) : (
                adminCatalog.map((p) => (
                  <option key={p.product_id} value={String(p.product_id)}>
                    #{p.product_id} — {p.product_name}
                    {Number(p.is_active) !== 1 ? ' (inactive)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {editForm && (
            <form onSubmit={handleUpdateProduct} className="space-y-4 border-t border-surface-container-high pt-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                  Product name *
                </label>
                <input
                  className="input-field w-full"
                  value={editForm.product_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, product_name: e.target.value }))
                  }
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                  Description
                </label>
                <textarea
                  className="input-field min-h-[88px] w-full resize-y"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                  Image URL
                </label>
                <input
                  type="url"
                  className="input-field w-full"
                  placeholder="https://…"
                  value={editForm.image_url}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, image_url: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="input-field w-full"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, price: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                    Stock quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input-field w-full"
                    value={editForm.stock_quantity}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        stock_quantity: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-on-surface-variant">
                  Category *
                </label>
                <select
                  className="input-field w-full"
                  value={editForm.category_id}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, category_id: e.target.value }))
                  }
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded border-surface-container-high"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                />
                <span className="text-on-surface">Active in store catalog</span>
              </label>
              {editMsg && (
                <p
                  className={`text-sm ${editMsg.includes('success') ? 'text-tertiary' : 'text-error'}`}
                  role="status"
                >
                  {editMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={editSubmitting}
                className="btn-primary disabled:opacity-60"
              >
                {editSubmitting ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight">Customers</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Registered shoppers ({customerTotal} total
          {customerSearch.trim() ? ' matching filter' : ''}).
        </p>
        <form
          onSubmit={handleCustomerSearch}
          className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              Search name or email
            </label>
            <input
              className="input-field w-full"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="e.g. rivera or @mail.com"
            />
          </div>
          <button type="submit" className="btn-secondary shrink-0">
            Search
          </button>
          <button
            type="button"
            className="btn-secondary shrink-0"
            onClick={() => {
              setCustomerSearch('');
              loadCustomers('');
            }}
          >
            Clear
          </button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-card border border-surface-container-high bg-surface-container-lowest shadow-ambient">
          {customersLoading ? (
            <div className="p-12 text-center text-on-surface-variant">
              Loading…
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              No customers found.
            </div>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-surface-container-high bg-surface-container-low/80">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Active</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.customer_id}
                    className="border-b border-surface-container-high/60 last:border-0"
                  >
                    <td className="px-4 py-3 tabular-nums text-on-surface-variant">
                      {c.customer_id}
                    </td>
                    <td className="px-4 py-3 font-medium text-on-surface">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-on-surface-variant">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {c.city}, {c.country}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          Number(c.is_active) === 1
                            ? 'rounded-full bg-tertiary/15 px-2 py-0.5 text-xs font-medium text-tertiary'
                            : 'rounded-full bg-on-surface-variant/15 px-2 py-0.5 text-xs font-medium text-on-surface-variant'
                        }
                      >
                        {Number(c.is_active) === 1 ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {dash?.topProducts && (
        <div className="mt-14">
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
