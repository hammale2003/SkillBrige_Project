import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import EmployeeHeader from '@/components/evaluation/EmployeeHeader';
import ModeSelector from '@/components/evaluation/ModeSelector';
import CompetenceResultCard from '@/components/evaluation/CompetenceResultCard';
import FormationsRecommandees from '@/components/evaluation/FormationsRecommandees';
import { useSkillBridgeStore, Employee, normalizeToEmployee } from '@/store/useSkillBridgeStore';
import { evaluateEmployee } from '@/api/evaluate';
import { Download, Save } from 'lucide-react';

export default function Evaluation() {
  const navigate = useNavigate();
  const {
    employeeJson, setEmployeeJson, setMode,
    setFinalOutput, finalOutput,
    setTestBlueprint, addEmployee,
    setLoadingPopup,

    recommendedFormations,
  } = useSkillBridgeStore();

  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [exportLabel, setExportLabel] = useState('Exporter JSON');
  const [saveLabel, setSaveLabel] = useState('Sauvegarder');

  const displayResult = finalOutput;

  useEffect(() => {
    if (employeeJson) {
      try {
        setEmployee(JSON.parse(employeeJson));
      } catch {
        setEmployee(null);
      }
    }
  }, [employeeJson]);

  const handleLaunch = async () => {
    if (!employeeJson) return;
    setLoading(true);
    setFinalOutput(null);
    setMode('generate_tests');
    setLoadingPopup('generating'); // stays open until real API response

    try {
      const response = await evaluateEmployee({
        employee_json: employeeJson,
        mode: 'generate_tests',
      });

      setTestBlueprint(response.test_blueprint || '');
      if (response.enriched_employee_json) {
        setEmployeeJson(response.enriched_employee_json);
      }
      setLoadingPopup(null);
      toast.success('Questions générées avec succès');
      navigate('/test-session');
    } catch (err: any) {
      setLoadingPopup(null);
      toast.error(err.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!displayResult) return;
    const blob = new Blob([JSON.stringify(displayResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation_${employee?.id || employee?.employee_id || 'output'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportLabel('✓ Exporté !');
    setTimeout(() => setExportLabel('Exporter JSON'), 2000);
  };

  const handleSave = () => {
    if (!displayResult) return;
    addEmployee(normalizeToEmployee(displayResult));
    toast.success('Sauvegardé dans le Dashboard');
    setSaveLabel('✓ Sauvegardé !');
    setTimeout(() => setSaveLabel('Sauvegarder'), 2000);
  };

  if (!employeeJson || !employee) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-16 lg:ml-60 p-6">
          <TopBar title="Évaluation" />
          <div className="text-center py-20 animate-fade-in">
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Aucun employé sélectionné</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Lancez une évaluation depuis le Dashboard.
            </p>
            <button className="btn-gradient" onClick={() => navigate('/')}>
              Retour au Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-16 lg:ml-60 p-6">
        <TopBar title="Évaluation" />
        <EmployeeHeader employee={employee} />
        <ModeSelector onLaunch={handleLaunch} loading={loading} />

        {displayResult && (
          <div className="animate-fade-in space-y-6">
            {/* Competence result cards */}
            {displayResult.competences && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayResult.competences.map((c: any) => (
                  <CompetenceResultCard key={c.competence_id || c.id} competence={c} />
                ))}
              </div>
            )}

            {/* Formations */}
            {displayResult.formations_recommandees && (
              <FormationsRecommandees
                formations={displayResult.formations_recommandees}
                recommendedFormations={recommendedFormations}
              />
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button className="btn-outline-blue flex items-center gap-2" onClick={handleExport}>
                <Download className="w-4 h-4" /> {exportLabel}
              </button>
              <button className="btn-gradient flex items-center gap-2" onClick={handleSave}>
                <Save className="w-4 h-4" /> {saveLabel}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
