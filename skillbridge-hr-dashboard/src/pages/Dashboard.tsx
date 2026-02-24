import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import StatsBar from '@/components/dashboard/StatsBar';
import EmployeeCard from '@/components/dashboard/EmployeeCard';
import NewEvaluationModal from '@/components/dashboard/NewEvaluationModal';
import { useSkillBridgeStore } from '@/store/useSkillBridgeStore';

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const employees = useSkillBridgeStore((s) => s.employees);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-16 lg:ml-60 p-6 transition-all">
        <TopBar title="Dashboard" showNewButton onNewEvaluation={() => setModalOpen(true)} />
        <StatsBar />

        {employees.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Aucun employé évalué</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par lancer une nouvelle évaluation pour voir les résultats ici.
            </p>
            <button className="btn-gradient" onClick={() => setModalOpen(true)}>
              Nouvelle Évaluation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {employees.map((emp) => (
              <EmployeeCard key={emp.id} employee={emp} />
            ))}
          </div>
        )}

        <NewEvaluationModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
    </div>
  );
}
