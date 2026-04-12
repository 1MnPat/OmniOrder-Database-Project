import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';

function formatMoney(n) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(n) || 0);
}

function ProductCardInner({ product, priority = false }) {
  const id = product.product_id;
  const title = product.product_name || 'GPU';
  const cat = product.category_name || '';
  const price = product.price;
  const stock = product.stock_quantity;
  const imageUrl = product.image_url;

  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col overflow-hidden rounded-card bg-surface-container-lowest shadow-ambient transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-container via-surface-container-low to-surface-container-high">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority={priority}
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <span className="text-center text-4xl font-bold tracking-tighter text-on-surface/10 transition group-hover:text-primary/20">
              GPU
            </span>
          </div>
        )}
        {stock !== undefined && stock < 10 && stock > 0 && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
            Low stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
          {cat}
        </p>
        <h3 className="text-lg font-semibold leading-tight tracking-tight text-on-surface group-hover:text-primary">
          {title}
        </h3>
        <p className="line-clamp-2 text-sm text-on-surface-variant">
          {product.description || 'High-performance graphics.'}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xl font-bold tracking-tight">
            {formatMoney(price)}
          </span>
          <span className="text-sm text-on-surface-variant">
            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export const ProductCard = memo(ProductCardInner);
