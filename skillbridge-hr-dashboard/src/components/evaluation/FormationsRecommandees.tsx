import { GraduationCap, ExternalLink } from 'lucide-react';
import { Formation } from '@/store/useSkillBridgeStore';

const platformColors: Record<string, { bg: string; dot: string }> = {
  Udemy:              { bg: 'bg-orange-500/20 text-orange-300',  dot: 'bg-orange-400' },
  Coursera:           { bg: 'bg-blue-500/20 text-blue-300',      dot: 'bg-blue-400' },
  Pluralsight:        { bg: 'bg-pink-500/20 text-pink-300',      dot: 'bg-pink-400' },
  YouTube:            { bg: 'bg-red-500/20 text-red-300',        dot: 'bg-red-400' },
  'LinkedIn Learning':{ bg: 'bg-sky-500/20 text-sky-300',       dot: 'bg-sky-400' },
  Other:              { bg: 'bg-muted text-muted-foreground',    dot: 'bg-muted-foreground' },
};

function getPlatformStyle(platform?: string) {
  if (!platform) return platformColors.Other;
  return platformColors[platform] ?? platformColors.Other;
}

const priorityColors: Record<string, string> = {
  Prioritaire: 'bg-destructive/20 text-red-300 border border-destructive/40',
  Important:   'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
  Utile:       'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
};

interface Props {
  formations: Formation[];
  recommendedFormations?: Formation[];
}

export default function FormationsRecommandees({ formations, recommendedFormations = [] }: Props) {
  // Agent 6 results (with URLs) take precedence
  const merged: Formation[] = recommendedFormations.length > 0 ? recommendedFormations : formations;
  if (!merged.length) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in shadow-md">
      <div className="flex items-center gap-2 mb-5">
        <GraduationCap className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Formations Recommandées</h3>
        {recommendedFormations.length > 0 && (
          <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
            IA + Web Search
          </span>
        )}
      </div>

      <div className="space-y-3">
        {merged.map((f, i) => {
          const platformStyle = getPlatformStyle(f.platform);
          const hasUrl = !!f.url && f.url.startsWith('http');
          const CardTag = hasUrl ? 'a' : 'div';
          const linkProps = hasUrl ? { href: f.url, target: '_blank', rel: 'noopener noreferrer' } : {};

          return (
            <CardTag
              key={i}
              {...(linkProps as any)}
              className={`group block bg-muted/40 rounded-xl p-4 border border-border/60
                ${hasUrl ? 'hover:border-primary/40 hover:bg-muted/70 transition-all cursor-pointer' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {f.name}
                    </h4>
                    {hasUrl && (
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    )}
                  </div>
                  {f.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{f.description}</p>
                  )}
                  {((f.competences_cibles ?? f.competences) || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(f.competences_cibles ?? f.competences)!.map((c, j) => (
                        <span key={j} className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityColors[f.priority] ?? 'bg-muted text-muted-foreground'}`}>
                    {f.priority}
                  </span>
                  {f.platform && (
                    <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${platformStyle.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${platformStyle.dot}`} />
                      {f.platform}
                    </span>
                  )}
                </div>
              </div>
              {f.importance !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Pertinence</span><span>{f.importance}/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(f.importance / 10) * 100}%` }} />
                  </div>
                </div>
              )}
            </CardTag>
          );
        })}
      </div>
    </div>
  );
}
