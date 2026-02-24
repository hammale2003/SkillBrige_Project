import { Clock, Calendar } from 'lucide-react';
import LevelBadge from '@/components/ui/LevelBadge';
import { Employee } from '@/store/useSkillBridgeStore';
import { useNavigate } from 'react-router-dom';
import { useSkillBridgeStore } from '@/store/useSkillBridgeStore';

interface EmployeeCardProps {
  employee: Employee;
}

const priorityColors: Record<string, string> = {
  Prioritaire: 'bg-destructive text-destructive-foreground',
  Important: 'bg-warning text-warning-foreground',
  Utile: 'bg-success text-success-foreground',
};

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const navigate = useNavigate();
  const setCurrentEmployeeId = useSkillBridgeStore((s) => s.setCurrentEmployeeId);
  const setEmployeeJson = useSkillBridgeStore((s) => s.setEmployeeJson);

  const handleViewDetails = () => {
    setCurrentEmployeeId(employee.id);
    setEmployeeJson(JSON.stringify(employee, null, 2));
    navigate('/evaluation');
  };

  const handleReevaluate = () => {
    setCurrentEmployeeId(employee.id);
    setEmployeeJson(JSON.stringify(employee, null, 2));
    navigate('/evaluation');
  };

  return (
    <div className="employee-card flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-foreground">{employee.name}</h3>
          <span className="btn-outline-blue !px-2 !py-0.5 !text-[11px] !font-bold !border">
            {employee.department}
          </span>
        </div>
        <p className="text-[13px] text-muted-foreground">{employee.position}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {employee.seniority_months} mois
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {employee.evaluation_date}
          </span>
        </div>
      </div>

      {/* Competences */}
      {employee.competences.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Compétences
          </div>
          <div className="space-y-1.5">
            {employee.competences.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-[13px]">
                <span className="text-foreground truncate mr-2">{c.name}</span>
                <LevelBadge level={c.current_level} />
              </div>
            ))}
            {employee.competences.length > 4 && (
              <div className="text-[11px] text-muted-foreground">+{employee.competences.length - 4} autres</div>
            )}
          </div>
        </div>
      )}

      {/* Formations Suivies */}
      {employee.formations_suivies && employee.formations_suivies.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Formations Suivies
          </div>
          {employee.formations_suivies.slice(0, 2).map((f, i) => (
            <div key={i} className="flex justify-between text-[13px] text-muted-foreground italic">
              <span>{f.name}</span>
              <span>{f.year}</span>
            </div>
          ))}
        </div>
      )}

      {/* Formations Recommandées */}
      {employee.formations_recommandees && employee.formations_recommandees.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Formations Recommandées
          </div>
          {employee.formations_recommandees.slice(0, 2).map((f, i) => (
            <div key={i} className="flex items-center justify-between text-[13px] mb-1">
              <span className="text-foreground">{f.name}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityColors[f.priority] || 'bg-muted text-muted-foreground'}`}>
                {f.priority}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex gap-2 pt-3 border-t border-border">
        <button className="btn-outline-blue flex-1 !text-[13px] !px-3 !py-2" onClick={handleViewDetails}>
          Voir Détails
        </button>
        <button className="btn-gradient flex-1 !text-[13px] !px-3 !py-2" onClick={handleReevaluate}>
          Réévaluer
        </button>
      </div>
    </div>
  );
}
