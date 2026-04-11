'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '12');
    if (search.trim()) params.set('search', search.trim());
    if (categoryId) params.set('category_id', categoryId);
    const res = await fetch(`/api/products?${params}`);
    const body = await res.json();
    if (body.success && body.data) {
      setProducts(body.data.data || []);
      setTotal(body.data.total ?? 0);
      setTotalPages(body.data.totalPages ?? 1);
    }
    setLoading(false);
  }, [page, search, categoryId]);

  useEffect(() => {
    fetch('/api/categories?limit=100')
      .then((r) => r.json())
      .then((body) => {
        if (body.success && body.data?.categories) {
          setCategories(body.data.categories);
        }
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function applyFilters() {
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-on-surface">
          GPU catalog
        </h1>
        <p className="mt-3 text-lg text-on-surface-variant">
          Filter by category or search by name — tonal surfaces, no divider
          noise.
        </p>
      </div>

      <div className="mb-10 flex flex-col gap-4 rounded-card bg-surface-container-low p-6 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Search
          </span>
          <input
            className="input-field"
            placeholder="RTX, Radeon, VRAM…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
        </label>
        <label className="flex w-full flex-col gap-2 sm:w-56">
          <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Category
          </span>
          <select
            className="input-field"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={String(c.category_id)}>
                {c.category_name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn-secondary self-stretch sm:self-auto"
          onClick={applyFilters}
        >
          Apply
        </button>
      </div>

      {loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-card bg-surface-container"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="rounded-card bg-surface-container-lowest p-12 text-center text-on-surface-variant">
          No products match your filters.
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm text-on-surface-variant">
            {total} product{total !== 1 ? 's' : ''} · Page {page} of{' '}
            {totalPages}
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
          <div className="mt-12 flex justify-center gap-4">
            <button
              type="button"
              className="btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
