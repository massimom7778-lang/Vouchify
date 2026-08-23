import type { PhotoSlot } from '@/data/products';
import { cn } from '@/lib/cn';

const aspects: Record<PhotoSlot['aspect'], string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9] md:aspect-[21/9]',
};

/**
 * Stands in for photography that does not exist yet. It is deliberately a flat
 * warm-grey block carrying the exact shot description, so the brief for the
 * photographer is readable straight off the page. Swap for <Image> per slot.
 */
export function PhotoBlock({
  photo,
  vignette = false,
  square = false,
  className,
}: {
  photo: PhotoSlot;
  vignette?: boolean;
  square?: boolean;
  className?: string;
}) {
  return (
    <figure
      role="img"
      aria-label={photo.alt}
      className={cn(
        'relative flex w-full items-end overflow-hidden border border-warm-300',
        vignette ? 'vignette' : 'bg-warm-200',
        square ? 'rounded-none' : 'rounded-md',
        aspects[photo.aspect],
        className,
      )}
    >
      <figcaption className="w-full p-4">
        <span className="inline-block max-w-full rounded-sm border border-warm-400 bg-warm-100/80 px-2 py-1 text-2xs font-semibold uppercase tracking-wide text-warm-700">
          TODO: {photo.todo}
        </span>
      </figcaption>
    </figure>
  );
}
