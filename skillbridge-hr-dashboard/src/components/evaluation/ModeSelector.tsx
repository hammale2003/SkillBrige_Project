import { FileEdit } from 'lucide-react';

interface Props {
  onLaunch: () => void;
  loading?: boolean;
}

export default function ModeSelector({ onLaunch, loading }: Props) {
  return (
    <div className="mb-6 animate-fade-in">
      <div className="p-6 rounded-xl border-2 border-primary-mid bg-accent card-shadow mb-4">
        <div className="flex items-center gap-3 mb-2">
          <FileEdit className="w-6 h-6 text-primary-mid" />
          <h3 className="text-base font-bold text-foreground">Session de Test QCM</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Génère un QCM par compétence, le soumet à l'employé, puis évalue automatiquement avec les résultats.
        </p>
      </div>
      <button
        className="btn-gradient w-full !py-3 text-base"
        disabled={loading}
        onClick={onLaunch}
      >
        {loading ? 'Génération des questions...' : 'Générer les questions'}
      </button>
    </div>
  );
}
