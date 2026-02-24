import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import CompetenceTestCard from '@/components/test-session/CompetenceTestCard';
import SubmitBar from '@/components/test-session/SubmitBar';
import ConfirmModal from '@/components/test-session/ConfirmModal';
import { useSkillBridgeStore, normalizeToEmployee } from '@/store/useSkillBridgeStore';
import { evaluateEmployee, recommendFormations } from '@/api/evaluate';

interface TestData {
  selectedOption: string; // "A" | "B" | "C" | "D" | ""
}

/** Support both competence_id (server JSON) and id (store type) */
const getCid = (c: any): string => c.competence_id || c.id || '';

export default function TestSession() {
  const navigate = useNavigate();
  const { employeeJson, setFinalOutput, setMode,
          addEmployee,
          setLoadingPopup, setRecommendedFormations } = useSkillBridgeStore();

  const [employee, setEmployee] = useState<any>(null);
  const [competences, setCompetences] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [testData, setTestData] = useState<Record<string, TestData>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (employeeJson) {
      try {
        const parsed = JSON.parse(employeeJson);
        setEmployee(parsed);
        const comps = parsed.competences || [];
        setCompetences(comps);
        const initial: Record<string, TestData> = {};
        comps.forEach((c: any) => {
          initial[getCid(c)] = { selectedOption: '' };
        });
        setTestData(initial);
      } catch {
        // invalid
      }
    }
  }, [employeeJson]);

  const scored = Object.values(testData).filter((d) => d.selectedOption !== '').length;

  const handleSubmit = async () => {
    setConfirmOpen(false);
    setMode('evaluate');

    const scores: Record<string, number> = {};
    competences.forEach((c: any) => {
      const cid = getCid(c);
      const selected = testData[cid]?.selectedOption || '';
      const correct = (c.correct_answer || '').toUpperCase();
      scores[cid] = selected && correct && selected === correct ? 20 : 0;
    });

    try {
      setLoadingPopup('evaluating'); // stays open until real API response
      navigate('/evaluation');

      const response = await evaluateEmployee({
        employee_json: employeeJson,
        mode: 'evaluate',
        test_scores: scores,
      });

      if (response.final_output) {
        const parsed = JSON.parse(response.final_output);
        setFinalOutput(parsed);
        addEmployee(normalizeToEmployee(parsed));

        // Agent 6: search for real training courses
        setLoadingPopup('suggesting');
        try {
          const recResult = await recommendFormations(response.final_output);
          setRecommendedFormations(recResult.formations ?? []);
        } catch {
          // Agent 6 failure is non-blocking
        }
      }
      setLoadingPopup(null);
      toast.success('Évaluation terminée');
    } catch (err: any) {
      setLoadingPopup(null);
      toast.error(err.message || 'Erreur de connexion au serveur');
    }
  };

  if (!employee || competences.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-16 lg:ml-60 p-6">
          <TopBar title="Session de Test" />
          <div className="text-center py-20 animate-fade-in">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Aucune session en cours</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Lancez une évaluation en mode "Session de Test Manuelle" d'abord.
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
    <div className="min-h-screen bg-background pb-20">
      <Sidebar />
      <main className="ml-16 lg:ml-60 p-6">
        <TopBar title="Session de Test" />

        {/* Header info */}
        <div className="mb-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{employee.employee_name || employee.name}</h2>
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">
              {competences.length} compétences
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sélectionnez une réponse pour chaque compétence puis soumettez
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {competences.map((c: any, i) => {
            const isActive = activeTab === i;
            const cid = getCid(c);
            const isScored = testData[cid]?.selectedOption !== '';
            return (
              <button
                key={cid}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-[3px] transition-all relative
                  ${isActive ? 'border-primary-mid text-primary-mid font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}
                `}
              >
                {c.titre || c.name}
                {isScored && (
                  <span className="absolute top-1.5 right-1 w-2 h-2 rounded-full bg-success" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active competence card */}
        {competences[activeTab] && (() => {
          const comp = competences[activeTab] as any;
          const cid = getCid(comp);
          return (
            <CompetenceTestCard
              key={cid}
              question={comp.question || 'Aucune question générée'}
              options={comp.options || []}
              correctAnswer={(comp.correct_answer || '').toUpperCase()}
              selectedOption={testData[cid]?.selectedOption || ''}
              onSelect={(opt) =>
                setTestData((prev) => ({
                  ...prev,
                  [cid]: { selectedOption: opt },
                }))
              }
              competenceId={cid}
              competenceName={comp.titre || comp.name || cid}
              onNext={() => setActiveTab((prev) => Math.min(prev + 1, competences.length - 1))}
              isLast={activeTab === competences.length - 1}
            />
          );
        })()}
      </main>

      <SubmitBar scored={scored} total={competences.length} onSubmit={() => setConfirmOpen(true)} />
      <ConfirmModal
        open={confirmOpen}
        count={competences.length}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
