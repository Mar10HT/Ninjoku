import type { FeedbackValue } from '../../lib/feedback';

interface Props {
  value: string | string[];
  feedback: FeedbackValue;
  col: number; // 1-based column index for stagger delay
}

const BG: Record<FeedbackValue, string> = {
  match: 'bg-match',
  partial: 'bg-partial',
  none: 'bg-miss',
  higher: 'bg-miss',
  lower: 'bg-miss',
};

// Non-color symbols — every state has a distinct symbol for colorblind accessibility
const SYMBOL: Record<FeedbackValue, string> = {
  match: '✓',
  partial: '≈',
  none: '✗',
  higher: '↑',
  lower: '↓',
};

export function FieldCell({ value, feedback, col }: Props) {
  const display = Array.isArray(value) ? value.join(', ') : value || '—';
  const symbol = SYMBOL[feedback];
  const bg = BG[feedback];

  return (
    <td
      title={display}
      className={`${bg} text-white font-body px-2 py-3 text-center align-middle border border-white/20 min-w-[72px] max-w-[120px] animate-flip-in-y`}
      style={{ animationDelay: `${col * 150}ms` }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-base font-bold leading-none">{symbol}</span>
        <span className="leading-tight line-clamp-2 break-words text-xs">{display}</span>
      </div>
    </td>
  );
}
