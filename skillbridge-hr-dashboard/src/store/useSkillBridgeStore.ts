import { create } from 'zustand';

export interface LogEntry {
  text: string;
  done: boolean;
}

export interface Competence {
  id: string;
  name: string;
  type: 'coding' | 'soft-skill' | 'architecture' | 'methodology';
  current_level: number;
  previous_level?: number;
  score?: number;
  max_score?: number;
  expected_levels?: { '6m': number; '12m': number; '24m': number };
  question?: string;
  question_type?: string;
  options?: string[];
  correct_answer?: string;
}

export interface Formation {
  name: string;
  priority: 'Prioritaire' | 'Important' | 'Utile';
  importance?: number;
  competences?: string[];
  competences_cibles?: string[];
  year?: number;
  // Agent 6 enriched fields
  url?: string;
  platform?: string;
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  seniority_months: number;
  evaluation_date: string;
  competences: Competence[];
  formations_suivies?: { name: string; year: number }[];
  formations_recommandees?: Formation[];
  // Backend JSON field aliases
  employee_id?: string;
  employee_name?: string;
  poste?: string;
  anciennete_mois?: number;
}

type Mode = 'simulate' | 'generate_tests' | 'evaluate';

interface SkillBridgeState {
  employeeJson: string;
  testBlueprint: string;
  finalOutput: any | null;
  mode: Mode;
  agentStep: number;
  employees: Employee[];
  currentEmployeeId: string | null;
  processingLogs: LogEntry[];
  loadingPopup: 'generating' | 'evaluating' | 'suggesting' | null;
  recommendedFormations: Formation[];

  setEmployeeJson: (json: string) => void;
  setTestBlueprint: (bp: string) => void;
  setFinalOutput: (out: any) => void;
  setMode: (mode: Mode) => void;
  setAgentStep: (step: number) => void;
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  setCurrentEmployeeId: (id: string | null) => void;
  loadFromLocalStorage: () => void;
  addLog: (text: string, done?: boolean) => void;
  markLastLogDone: () => void;
  clearLogs: () => void;
  setLoadingPopup: (phase: 'generating' | 'evaluating' | 'suggesting' | null) => void;
  setRecommendedFormations: (formations: Formation[]) => void;
}

/** Normalize backend JSON (snake_case fields) into the store Employee shape */
export function normalizeToEmployee(raw: any): Employee {
  return {
    id: raw.employee_id || raw.id || String(Date.now()),
    name: raw.employee_name || raw.name || 'Inconnu',
    department: raw.department || '—',
    position: raw.poste || raw.position || '—',
    seniority_months: raw.anciennete_mois ?? raw.seniority_months ?? 0,
    evaluation_date: raw.evaluation_date || new Date().toISOString().split('T')[0],
    competences: (raw.competences || []).map((c: any) => ({
      id: c.competence_id || c.id || '',
      name: c.titre || c.name || c.competence_id || '',
      type: c.type || 'coding',
      current_level: c.niveau_estime ?? c.current_level ?? 0,
      previous_level: c._metadata_evaluation?.niveau_avant_test ?? c.previous_level,
      score: c._metadata_evaluation?.score_test ?? c.score,
      max_score: 20,
      expected_levels: {
        '6m':  c.niveau_attendu_6m  ?? c.expected_levels?.['6m'],
        '12m': c.niveau_attendu_12m ?? c.expected_levels?.['12m'],
        '24m': c.niveau_attendu_24m ?? c.expected_levels?.['24m'],
      },
    })),
    formations_recommandees: raw.formations_recommandees,
    formations_suivies: (raw.formations_suivies || []).map((f: any) =>
      typeof f === 'string' ? { name: f, year: 0 } : f
    ),
    employee_id: raw.employee_id,
    employee_name: raw.employee_name,
    poste: raw.poste,
    anciennete_mois: raw.anciennete_mois,
  };
}

const getStoredEmployees = (): Employee[] => {
  try {
    const stored = localStorage.getItem('skillbridge_employees');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useSkillBridgeStore = create<SkillBridgeState>((set, get) => ({
  employeeJson: '',
  testBlueprint: '',
  finalOutput: null,
  mode: 'simulate',
  agentStep: 0,
  employees: getStoredEmployees(),
  currentEmployeeId: null,
  processingLogs: [],
  loadingPopup: null,
  recommendedFormations: [],

  setEmployeeJson: (json) => set({ employeeJson: json }),
  setTestBlueprint: (bp) => set({ testBlueprint: bp }),
  setFinalOutput: (out) => set({ finalOutput: out }),
  setMode: (mode) => set({ mode }),
  setAgentStep: (step) => set({ agentStep: step }),
  addLog: (text, done = false) =>
    set((s) => ({ processingLogs: [...s.processingLogs, { text, done }] })),
  markLastLogDone: () =>
    set((s) => ({
      processingLogs: s.processingLogs.map((e, i) =>
        i === s.processingLogs.length - 1 ? { ...e, done: true } : e
      ),
    })),
  clearLogs: () => set({ processingLogs: [] }),
  setLoadingPopup: (phase) => set({ loadingPopup: phase }),
  setRecommendedFormations: (formations) => set({ recommendedFormations: formations }),
  addEmployee: (emp) => {
    const employees = [...get().employees.filter(e => e.id !== emp.id), emp];
    localStorage.setItem('skillbridge_employees', JSON.stringify(employees));
    set({ employees });
  },
  updateEmployee: (id, data) => {
    const employees = get().employees.map(e => e.id === id ? { ...e, ...data } : e);
    localStorage.setItem('skillbridge_employees', JSON.stringify(employees));
    set({ employees });
  },
  setCurrentEmployeeId: (id) => set({ currentEmployeeId: id }),
  loadFromLocalStorage: () => set({ employees: getStoredEmployees() }),
}));
