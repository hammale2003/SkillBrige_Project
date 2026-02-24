import { useState, useCallback } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useSkillBridgeStore } from '@/store/useSkillBridgeStore';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewEvaluationModal({ open, onClose }: Props) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const setEmployeeJson = useSkillBridgeStore((s) => s.setEmployeeJson);
  const setCurrentEmployeeId = useSkillBridgeStore((s) => s.setCurrentEmployeeId);
  const navigate = useNavigate();

  const validateJson = useCallback((text: string) => {
    setJsonText(text);
    if (!text.trim()) {
      setError('');
      setIsValid(false);
      return;
    }
    try {
      JSON.parse(text);
      setError('');
      setIsValid(true);
    } catch (e: any) {
      setError(e.message);
      setIsValid(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => validateJson(ev.target?.result as string);
      reader.readAsText(file);
    }
  }, [validateJson]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => validateJson(ev.target?.result as string);
      reader.readAsText(file);
    }
  }, [validateJson]);

  const handleSubmit = () => {
    if (!isValid) return;
    try {
      const parsed = JSON.parse(jsonText);
      setEmployeeJson(jsonText);
      setCurrentEmployeeId(parsed.id || null);
      onClose();
      navigate('/evaluation');
    } catch {
      // already validated
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-card rounded-2xl card-shadow p-6 w-full max-w-lg mx-4 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-primary">Nouvelle Évaluation</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          className="border-2 border-dashed border-primary-mid rounded-xl p-8 text-center bg-accent cursor-pointer mb-4 transition-colors hover:bg-accent/80"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="w-10 h-10 text-primary-mid mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Glissez votre input.json ici ou <span className="text-primary-mid font-medium">cliquez pour parcourir</span>
          </p>
          <input id="file-input" type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">OU</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Textarea */}
        <textarea
          value={jsonText}
          onChange={(e) => validateJson(e.target.value)}
          placeholder="Collez votre JSON ici..."
          rows={8}
          className="input-styled font-mono text-xs bg-muted resize-none mb-2"
        />

        {/* Validation feedback */}
        {jsonText.trim() && (
          <div className={`flex items-center gap-2 text-xs mb-4 ${isValid ? 'text-success' : 'text-destructive'}`}>
            {isValid ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {isValid ? 'JSON valide ✓' : error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button className="btn-outline-blue flex-1" onClick={onClose}>Annuler</button>
          <button className="btn-gradient flex-1" disabled={!isValid} onClick={handleSubmit}>
            Démarrer l'évaluation
          </button>
        </div>
      </div>
    </div>
  );
}
