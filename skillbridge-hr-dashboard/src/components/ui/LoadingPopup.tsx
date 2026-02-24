import { useEffect } from 'react';

interface Props {
  phase: 'generating' | 'evaluating' | 'suggesting' | null;
}

const config = {
  generating: {
    icon: '🧠',
    title: 'Génération des QCM',
    subtitle: 'Agent 1 + 2 analysent le profil et créent vos questions...',
    ring: 'border-blue-500',
    glow: 'shadow-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    badgeText: 'Génération IA',
    dots: ['bg-blue-500', 'bg-blue-400', 'bg-blue-300'],
  },
  evaluating: {
    icon: '⚡',
    title: 'Évaluation en cours',
    subtitle: 'Agents 3, 4 et 5 calculent vos scores et valident les résultats...',
    ring: 'border-violet-500',
    glow: 'shadow-violet-500/30',
    badge: 'bg-violet-500/20 text-violet-300 border border-violet-500/40',
    badgeText: 'Scoring IA',
    dots: ['bg-violet-500', 'bg-violet-400', 'bg-violet-300'],
  },
  suggesting: {
    icon: '🎓',
    title: 'Recherche de formations',
    subtitle: 'Agent 6 recherche les meilleures formations Udemy, Coursera...',
    ring: 'border-emerald-500',
    glow: 'shadow-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    badgeText: 'Recherche Web',
    dots: ['bg-emerald-500', 'bg-emerald-400', 'bg-emerald-300'],
  },
};

export default function LoadingPopup({ phase }: Props) {
  // Prevent body scroll while open
  useEffect(() => {
    if (phase) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  if (!phase) return null;

  const c = config[phase];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div
        className={`relative bg-[#0f1117] border border-white/10 rounded-2xl p-10 flex flex-col items-center gap-6 w-[340px] shadow-2xl ${c.glow}`}
        style={{ boxShadow: `0 0 60px 10px var(--tw-shadow-color)` }}
      >
        {/* Spinning ring + icon */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Outer spinning ring */}
          <div
            className={`absolute inset-0 rounded-full border-4 border-transparent ${c.ring} border-t-current animate-spin`}
            style={{ borderTopColor: 'currentColor' }}
          />
          {/* Inner dimmed ring */}
          <div className="absolute inset-2 rounded-full border-2 border-white/5" />
          {/* Icon */}
          <span className="text-4xl select-none">{c.icon}</span>
        </div>

        {/* Badge */}
        <span className={`text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${c.badge}`}>
          {c.badgeText}
        </span>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-white text-xl font-bold">{c.title}</h2>
          <p className="text-white/50 text-sm leading-relaxed">{c.subtitle}</p>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-2 mt-2">
          {c.dots.map((dot, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${dot} animate-bounce`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
