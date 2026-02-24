import { Plus } from 'lucide-react';

interface TopBarProps {
  title: string;
  onNewEvaluation?: () => void;
  showNewButton?: boolean;
}

export default function TopBar({ title, onNewEvaluation, showNewButton = false }: TopBarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      {showNewButton && (
        <button className="btn-gradient flex items-center gap-2" onClick={onNewEvaluation}>
          <Plus className="w-4 h-4" />
          Nouvelle Évaluation
        </button>
      )}
    </div>
  );
}
