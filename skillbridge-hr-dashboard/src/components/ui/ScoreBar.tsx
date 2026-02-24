interface ScoreBarProps {
  value: number;
  max: number;
  animated?: boolean;
}

export default function ScoreBar({ value, max, animated = true }: ScoreBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const color =
    value / max >= 0.7 ? 'bg-success' : value / max >= 0.4 ? 'bg-warning' : 'bg-destructive';

  return (
    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} ${animated ? 'animate-bar-fill' : ''}`}
        style={{ '--bar-width': `${pct}%`, width: animated ? undefined : `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}
