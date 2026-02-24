const levelColors: Record<number, string> = {
  0: 'bg-level-0',
  1: 'bg-level-1',
  2: 'bg-level-2',
  3: 'bg-level-3',
  4: 'bg-level-4',
  5: 'bg-level-5',
};

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md';
}

export default function LevelBadge({ level, size = 'sm' }: LevelBadgeProps) {
  const clamped = Math.max(0, Math.min(5, Math.round(level)));
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white
        ${levelColors[clamped] || 'bg-muted-foreground'}
        ${size === 'sm' ? 'text-[11px] px-2.5 py-0.5 min-w-[28px]' : 'text-xs px-3 py-1 min-w-[32px]'}
      `}
    >
      {clamped}
    </span>
  );
}
