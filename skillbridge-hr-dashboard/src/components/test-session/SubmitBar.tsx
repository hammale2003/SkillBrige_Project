interface Props {
  scored: number;
  total: number;
  onSubmit: () => void;
}

export default function SubmitBar({ scored, total, onSubmit }: Props) {
  const allScored = scored >= total && total > 0;
  const pct = total > 0 ? (scored / total) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="ml-16 lg:ml-60 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {scored} / {total} compétences scorées
          </span>
          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full gradient-primary transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button className="btn-gradient" disabled={!allScored} onClick={onSubmit}>
          Valider et Soumettre
        </button>
      </div>
    </div>
  );
}
