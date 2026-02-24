const BASE_URL = 'http://localhost:8000';

interface EvaluateRequest {
  employee_json: string;
  mode: 'simulate' | 'generate_tests' | 'evaluate';
  test_scores?: Record<string, number>;
}

interface EvaluateResponse {
  final_output?: string;
  test_blueprint?: string;
  analysis?: string;
  /** Employee JSON enriched with question/question_type per competence (generate_tests mode) */
  enriched_employee_json?: string;
}

export async function evaluateEmployee(req: EvaluateRequest): Promise<EvaluateResponse> {
  const res = await fetch(`${BASE_URL}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw new Error(`Erreur serveur: ${res.status}`);
  }

  const data = await res.json();

  if (!data.final_output && !data.test_blueprint && !data.analysis) {
    throw new Error('Réponse vide reçue du serveur');
  }

  return data;
}
