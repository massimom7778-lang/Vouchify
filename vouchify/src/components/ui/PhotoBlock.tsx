import Image from 'next/image';
import type { PhotoSlot } from '@/data/products';
import { cn } from '@/lib/cn';

const aspects: Record<PhotoSlot['aspect'], string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9] md:aspect-[21/9]',
};

/** Roughly how wide this slot renders, so the browser fetches a sane size. */
const sizes: Record<PhotoSlot['aspect'], string> = {
  square: '(min-width: 1024px) 620px, (min-width: 768px) 50vw, 100vw',
  portrait: '(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw',
  landscape: '(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw',
  wide: '100vw',
};

/**
 * One image slot. With a real file it renders that; without one it renders a
 * flat warm-grey block carrying the exact shot description, so the shot list is
 * readable straight off the page.
 */
export function PhotoBlock({
  photo,
  vignette = false,
  square = false,
  priority = false,
  className,
}: {
  photo: PhotoSlot;
  vignette?: boolean;
  square?: boolean;
  /** Set on the one image above the fold. */
  priority?: boolean;
  className?: string;
}) {
  const shape = cn(
    'relative w-full overflow-hidden border border-warm-300',
    square ? 'rounded-none' : 'rounded-md',
    aspects[photo.aspect],
    className,
  );

  if (photo.src) {
    return (
      <div className={cn(shape, vignette ? 'vignette' : 'bg-warm-200')}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes[photo.aspect]}
          priority={priority}
          className="object-cover"
          style={photo.focus ? { objectPosition: photo.focus } : undefined}
        />
      </div>
    );
  }

  return (
    <figure
      role="img"
      aria-label={photo.alt}
      className={cn(shape, 'flex items-end', vignette ? 'vignette' : 'bg-warm-200')}
    >
      {process.env.NODE_ENV !== 'production' ? (
        <figcaption className="w-full p-4">
          <span className="inline-block max-w-full rounded-sm border border-warm-400 bg-warm-100/80 px-2 py-1 text-2xs font-semibold uppercase tracking-wide text-warm-700">
            TODO: {photo.todo}
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}
