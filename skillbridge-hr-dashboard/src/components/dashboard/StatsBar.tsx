import { Users, CheckCircle, Star, AlertTriangle } from 'lucide-react';
import { useSkillBridgeStore } from '@/store/useSkillBridgeStore';

export default function StatsBar() {
  const employees = useSkillBridgeStore((s) => s.employees);

  const totalEmployees = employees.length;
  const evaluationsComplete = employees.filter(
    (e) => e.competences?.some((c) => c.score !== undefined)
  ).length;

  const allLevels = employees.flatMap((e) => e.competences.map((c) => c.current_level));
  const avgLevel = allLevels.length ? (allLevels.reduce((a, b) => a + b, 0) / allLevels.length).toFixed(1) : '0.0';

  const belowTarget = employees.reduce((count, emp) => {
    return count + emp.competences.filter((c) => {
      const target = c.expected_levels?.['12m'] ?? 3;
      return c.current_level < target;
    }).length;
  }, 0);

  const tiles = [
    { label: 'Total Employés', value: totalEmployees, icon: Users, color: 'text-primary' },
    { label: 'Évaluations Complètes', value: evaluationsComplete, icon: CheckCircle, color: 'text-success' },
    { label: 'Niveau Moyen', value: avgLevel, icon: Star, color: 'text-primary-mid' },
    { label: 'Compétences Sous Cible', value: belowTarget, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {tiles.map((tile) => (
        <div key={tile.label} className="bg-card rounded-xl card-shadow border border-border p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className={`text-3xl font-bold ${tile.color}`}>{tile.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{tile.label}</div>
            </div>
            <tile.icon className={`w-5 h-5 ${tile.color} opacity-60`} />
          </div>
        </div>
      ))}
    </div>
  );
}
