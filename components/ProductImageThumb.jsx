import Image from 'next/image';

export function ProductImageThumb({ src, alt, size = 64 }) {
  if (!src) return null;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg bg-surface-container"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt || 'Product'}
        width={size}
        height={size}
        className="object-cover"
      />
    </div>
  );
}
