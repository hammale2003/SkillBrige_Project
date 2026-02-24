import LevelBadge from '@/components/ui/LevelBadge';
import ScoreBar from '@/components/ui/ScoreBar';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

interface Props {
  competence: any; // handles both store Competence and backend JSON shapes
}

const typeColors: Record<string, string> = {
  coding: 'bg-primary-mid/10 text-primary-mid',
  sciences: 'bg-teal-100 text-teal-700',
  'soft-skill': 'bg-purple-100 text-purple-700',
  architecture: 'bg-teal-100 text-teal-700',
  methodology: 'bg-orange-100 text-orange-700',
};

export default function CompetenceResultCard({ competence: c }: Props) {
  // Support both backend JSON field names and store field names
  const name       = c.titre        ?? c.name        ?? c.competence_id ?? '—';
  const type       = c.type         ?? 'coding';
  const meta       = c._metadata_evaluation ?? {};
  const scoreTest  = meta.score_test   ?? c.score   ?? 0;
  const maxScore   = c.max_score       ?? 20;
  const levelBefore= meta.niveau_avant_test ?? c.previous_level ?? c.niveau_estime ?? 0;
  const levelNow   = c.niveau_estime   ?? c.current_level ?? 0;
  const diff       = levelNow - levelBefore;

  const expected = c.expected_levels ?? {
    '6m':  c.niveau_attendu_6m,
    '12m': c.niveau_attendu_12m,
    '24m': c.niveau_attendu_24m,
  };

  const ratio    = maxScore > 0 ? scoreTest / maxScore : 0;
  const bgTint   = ratio >= 0.7 ? 'bg-success/5' : ratio >= 0.4 ? 'bg-warning/5' : 'bg-destructive/5';
  const DiffIcon = diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : ArrowRight;
  const diffColor= diff > 0 ? 'text-success' : diff < 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className={`${bgTint} rounded-xl border border-border p-5 animate-fade-in`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[15px] font-bold text-foreground">{name}</h4>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeColors[type] || 'bg-muted text-muted-foreground'}`}>
          {type}
        </span>
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Score Test</span>
          <span className="font-bold text-foreground">{scoreTest}/{maxScore}</span>
        </div>
        <ScoreBar value={scoreTest} max={maxScore} />
      </div>

      {/* Level comparison */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-xs text-muted-foreground">Niveau avant</div>
        <LevelBadge level={levelBefore} />
        <DiffIcon className={`w-4 h-4 ${diffColor}`} />
        <div className="text-xs text-muted-foreground">Niveau actuel</div>
        <LevelBadge level={levelNow} />
      </div>

      {/* Expected levels */}
      {Object.entries(expected).some(([, v]) => v != null) && (
        <div className="space-y-1.5">
          {(['6m', '12m', '24m'] as const).map((period) => {
            const target = expected[period];
            if (target == null) return null;
            const gap = target - levelNow;
            const barColor = gap <= 0 ? 'bg-success' : gap <= 1 ? 'bg-warning' : 'bg-destructive';
            return (
              <div key={period} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-muted-foreground font-medium">{period}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${Math.min(100, (levelNow / Math.max(target, 1)) * 100)}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-4 text-right">{target}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

