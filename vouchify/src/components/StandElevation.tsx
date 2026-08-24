import { cn } from '@/lib/cn';

/**
 * A dimensioned elevation of the stand.
 *
 * This is a specification drawing, not a stand-in for a photograph. It carries
 * real information a buyer wants (footprint, material, what is inside) in the
 * same hairline language as the floor plan, which means the page reads as
 * specified rather than as unfinished while photography does not exist.
 */
export function StandElevation({
  tone = 'ink',
  className,
}: {
  tone?: 'ink' | 'paper';
  className?: string;
}) {
  const onInk = tone === 'ink';
  const rule = onInk ? '#4a4640' : '#d5cfc3';
  const line = onInk ? '#8f877a' : '#8f877a';
  const label = onInk ? '#b4ada0' : '#6b655b';
  const face = onInk ? '#171614' : '#f1eee8';
  const accent = onInk ? '#c9a961' : '#7d6318';

  return (
    <svg
      viewBox="0 0 340 430"
      className={cn('w-full', className)}
      role="img"
      aria-label="Dimensioned elevation of the stand: 76 millimetres wide, 127.5 millimetres tall, 3 millimetre acrylic, with the chip behind the upper face and a QR code printed below it."
    >
      <g fill="none" strokeLinecap="square">
        {/* --- the panel --- */}
        <rect x="70" y="34" width="152" height="255" rx="7" fill={face} stroke={line} strokeWidth="1.25" />

        {/* folded foot, seen edge on */}
        <path d="M70 289 L70 300 L222 300 L222 289" stroke={line} strokeWidth="1.25" />
        <path d="M62 300 L230 300" stroke={rule} strokeWidth="1" />

        {/* tap zone, marked where the chip actually sits */}
        <circle cx="146" cy="96" r="26" stroke={accent} strokeWidth="1.25" strokeDasharray="3 3" />
        <circle cx="146" cy="96" r="3" fill={accent} stroke="none" />

        {/* printed QR block */}
        <rect x="112" y="150" width="68" height="68" stroke={line} strokeWidth="1" />
        <g stroke={line} strokeWidth="1">
          <path d="M120 158h14v14h-14z" />
          <path d="M158 158h14v14h-14z" />
          <path d="M120 196h14v14h-14z" />
        </g>

        {/* --- vertical dimension, height --- */}
        <g stroke={line} strokeWidth="1">
          <path d="M252 34v255" />
          <path d="M247 34h10M247 289h10" />
          <path d="M222 34h34M222 289h34" strokeDasharray="2 3" stroke={rule} />
        </g>
        <text
          x="266" y="166" fill={label}
          className="font-sans text-[11px] font-semibold"
          style={{ letterSpacing: '0.08em' }}
        >
          127.5
        </text>

        {/* --- horizontal dimension, width --- */}
        <g stroke={line} strokeWidth="1">
          <path d="M70 336h152" />
          <path d="M70 331v10M222 331v10" />
          <path d="M70 300v40M222 300v40" strokeDasharray="2 3" stroke={rule} />
        </g>
        <text
          x="146" y="358" fill={label} textAnchor="middle"
          className="font-sans text-[11px] font-semibold"
          style={{ letterSpacing: '0.08em' }}
        >
          76
        </text>

        {/* --- leaders --- */}
        <g stroke={rule} strokeWidth="1">
          <path d="M146 70 L146 52 L36 52" />
          <path d="M112 184 L36 184" />
          <path d="M222 262 L296 262" />
        </g>
      </g>

      <g fill={label} className="font-sans text-[10px] font-semibold" style={{ letterSpacing: '0.1em' }}>
        <text x="36" y="46" textAnchor="start" fill={accent}>NTAG215</text>
        <text x="36" y="180" textAnchor="start">QR BACKUP</text>
        <text x="296" y="258" textAnchor="end">3MM ACRYLIC</text>
      </g>

      <text
        x="146" y="392" textAnchor="middle" fill={label}
        className="font-sans text-[10px] font-semibold" style={{ letterSpacing: '0.16em' }}
      >
        ALL DIMENSIONS IN MILLIMETRES
      </text>
    </svg>
  );
}
