import { GraduationCap } from 'lucide-react';
import ScoreBar from '@/components/ui/ScoreBar';
import { Formation } from '@/store/useSkillBridgeStore';

const priorityColors: Record<string, string> = {
  Prioritaire: 'bg-destructive text-destructive-foreground',
  Important: 'bg-warning text-warning-foreground',
  Utile: 'bg-success text-success-foreground',
};

interface Props {
  formations: Formation[];
}

export default function FormationsRecommandees({ formations }: Props) {
  if (!formations.length) return null;

  return (
    <div className="bg-card rounded-xl card-shadow border border-border p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Formations Recommandées</h3>
      </div>
      <div className="space-y-3">
        {formations.map((f, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground">{f.name}</h4>
                {f.competences && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {f.competences.map((c, j) => (
                      <span key={j} className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${priorityColors[f.priority] || 'bg-muted text-muted-foreground'}`}>
                {f.priority}
              </span>
            </div>
            {f.importance !== undefined && (
              <ScoreBar value={f.importance} max={10} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
