interface Props {
  open: boolean;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, count, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onCancel}>
      <div
        className="bg-card rounded-2xl card-shadow p-6 w-full max-w-md mx-4 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-foreground mb-3">Confirmer la soumission</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Vous êtes sur le point de soumettre les scores pour {count} compétences. 
          Cette action lancera l'évaluation finale.
        </p>
        <div className="flex gap-3">
          <button className="btn-outline-blue flex-1" onClick={onCancel}>Annuler</button>
          <button className="btn-gradient flex-1" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}
