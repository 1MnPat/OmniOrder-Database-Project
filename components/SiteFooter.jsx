import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-surface-container-low py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <p className="text-lg font-bold tracking-tight">Nexus Commerce</p>
            <p className="mt-2 max-w-sm text-sm text-on-surface-variant">
              A curated exhibition of performance. Inspired industrial design,
              real inventory from your course database.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-on-surface">Shop</span>
              <Link
                href="/products"
                className="text-on-surface-variant hover:text-primary"
              >
                Catalog
              </Link>
              <Link href="/cart" className="text-on-surface-variant hover:text-primary">
                Cart
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-on-surface">Account</span>
              <Link href="/login" className="text-on-surface-variant hover:text-primary">
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-on-surface-variant hover:text-primary"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-12 text-center text-xs text-on-surface-variant">
          Nexus Commerce · GPU store demo
        </p>
      </div>
    </footer>
  );
}
