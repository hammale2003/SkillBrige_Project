# SkillBridge — Multi-Agent Competency Evaluation System

[![CI](https://github.com/hammale2003/SkillBrige_Project/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/hammale2003/SkillBrige_Project/actions/workflows/unit-tests.yml)
[![Integration Tests](https://github.com/hammale2003/SkillBrige_Project/actions/workflows/integration-tests.yml/badge.svg)](https://github.com/hammale2003/SkillBrige_Project/actions/workflows/integration-tests.yml)

**SkillBridge** is a structured multi-agent AI system that evaluates employee competencies through dynamically generated QCM tests. Built on [LangGraph](https://github.com/langchain-ai/langgraph) with Google Gemini 3 Pro Preview, it orchestrates 5 specialized AI agents to analyze profiles, generate tests, score answers, validate consistency, and produce structured JSON evaluations.

---

## Architecture

```
input.json (employee profile)
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         LangGraph Graph                         │
│                                                                 │
│  Agent 1            Agent 2            Agent 3                  │
│  Skill Context  ──► Test Generation ──► Evaluation &            │
│  Analyzer           (QCM)               Scoring                 │
│                         │                    │                  │
│                         │ (generate_tests)    ▼                 │
│                         │              Agent 4                  │
│                         │              Consistency              │
│                         │              Validator                │
│                         │                    │                  │
│                         │                    ▼                  │
│                         │              Agent 5                  │
│                         │              JSON Output              │
│                         │              Controller               │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
output.json (enriched employee JSON with scores & levels)
```

### The 5 Agents

| # | Agent | Role |
|---|-------|------|
| 1 | **Skill Context Analyzer** | Analyzes employee profile, identifies risk areas, estimates difficulty for each competence |
| 2 | **Test Generation Agent** | Generates one QCM per competence with 4 options and a correct answer. Embeds real code snippets for coding competences |
| 3 | **Evaluation & Scoring Agent** | Scores answers (or simulates scoring), maps scores to `niveau_estime` (1–5 scale) |
| 4 | **Consistency Validator** | Validates that estimated levels are coherent with experience and career targets. Prevents illogical jumps > ±2 |
| 5 | **JSON Output Controller** | Reconstructs the final valid JSON with all `_metadata_evaluation` fields populated |

### Execution Modes

| Mode | Agents invoked | Use case |
|------|---------------|----------|
| `generate_tests` | 1 → 2 | Generate QCM questions; frontend shows them to the employee |
| `evaluate` | 1 → 3 → 4 → 5 | Score real employee answers and produce final output |
| `simulate` | 1 → 2 → 3 → 4 → 5 | Full automatic run without human test session |

---

## Project Structure

```
SkillBrige_Project/
├── src/agent/
│   ├── graph.py                          # LangGraph wiring (entry point)
│   ├── state.py                          # State dataclass
│   ├── llm.py                            # Gemini LLM helper
│   ├── server.py                         # FastAPI REST server
│   └── nodes/
│       ├── agent1_skill_context_analyzer.py
│       ├── agent2_test_generation.py
│       ├── agent3_evaluation_scoring.py
│       ├── agent4_consistency_validator.py
│       └── agent5_json_output_controller.py
├── tests/
│   ├── unit_tests/test_configuration.py
│   └── integration_tests/test_graph.py
├── skillbridge-hr-dashboard/             # React frontend (git submodule / separate repo)
├── input.json                            # Sample employee profile
├── Output.json                           # Sample evaluation output
├── langgraph.json                        # LangGraph Cloud config
└── pyproject.toml
```

---

## Prerequisites

- Python ≥ 3.10
- [uv](https://docs.astral.sh/uv/) package manager
- A Google AI API key with access to `gemini-2.5-pro-preview` (or `gemini-3-pro-preview`)
- Node.js ≥ 18 + npm (for the frontend)

---

## Backend Setup

### 1. Clone and install

```bash
git clone https://github.com/hammale2003/SkillBrige_Project.git
cd SkillBrige_Project
uv sync
```

### 2. Configure environment

Create a `.env` file at the project root:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

### 3. Run the API server

```bash
uv run uvicorn src.agent.server:app --reload --port 8000
```

The server will be available at `http://localhost:8000`.

### 4. Verify

```
GET http://localhost:8000/health
→ {"status": "ok", "service": "SkillBridge"}
```

---

## API Reference

### `POST /api/evaluate`

Run the multi-agent evaluation pipeline.

**Request body:**

```json
{
  "employee_json": "{ ... }",
  "mode": "generate_tests",
  "test_scores": {}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employee_json` | string | ✅ | Stringified employee profile JSON |
| `mode` | `generate_tests` \| `evaluate` \| `simulate` | ✅ | Execution mode |
| `test_scores` | `{competence_id: score}` | Only for `evaluate` | HR-validated scores (0–20) |

**Response:**

```json
{
  "final_output": "{ ... }",
  "test_blueprint": "...",
  "analysis": "...",
  "enriched_employee_json": "{ ... }"
}
```

| Field | Description |
|-------|-------------|
| `final_output` | Stringified evaluated employee JSON with `_metadata_evaluation` |
| `test_blueprint` | Raw agent-2 QCM blueprint text |
| `analysis` | Agent-1 profile analysis |
| `enriched_employee_json` | Employee JSON with `question`, `options`, `correct_answer` injected per competence |

---

## Input JSON Format

```json
{
  "employee_id": "EMP_0001",
  "employee_name": "Jean Dupont",
  "department": "MES",
  "poste": "Développeur C++",
  "anciennete_mois": 18,
  "evaluation_date": "2025-11-26",
  "competences": [
    {
      "competence_id": "COMP_001",
      "type": "coding",
      "titre": "C++ avancé",
      "detail": "Description of what the competence covers",
      "experience_employee": "What the employee has done with this skill",
      "niveau_estime": 3,
      "niveau_attendu_6m": 4,
      "niveau_attendu_12m": 5,
      "niveau_attendu_24m": 5
    }
  ],
  "projets_recents": ["Project A (2024)"],
  "projets_futurs": ["Project B (2026)"],
  "objectifs_carriere": "Career goal description",
  "formations_suivies": ["Degree/Training 1"]
}
```

**Levels scale (1–5):**

| Level | Meaning |
|-------|---------|
| 1 | Débutant |
| 2 | Notions |
| 3 | Opérationnel |
| 4 | Avancé |
| 5 | Expert |

---

## Running Tests

```bash
# Unit tests (no API key required)
uv run pytest tests/unit_tests/ -v

# Integration tests (requires GOOGLE_API_KEY)
uv run pytest tests/integration_tests/ -v
```

---

## Frontend Setup

The frontend is a separate React + Vite + TypeScript application.

```bash
cd skillbridge-hr-dashboard
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

> Make sure the backend is running on port 8000 before using the frontend.

**Frontend repository:** [hammale2003/skillbridge-hr-dashboard](https://github.com/hammale2003/skillbridge-hr-dashboard)

---

## Full Workflow

```
1. Open Dashboard → Click "Nouvelle Évaluation"
2. Upload or paste employee input.json
3. Click "Générer les questions" → Agent 1 + 2 run → QCM generated
4. TestSession page shows one QCM per competence with code blocks rendered
5. Select answers → Submit
6. Agent 1 + 3 + 4 + 5 run with real scores
7. Evaluation page shows results: score bars, level before/after, targets
8. Employee auto-saved to Dashboard
9. Export evaluation JSON
```

---

## Tech Stack

**Backend:**
- [LangGraph](https://github.com/langchain-ai/langgraph) ≥ 1.0.0 — multi-agent graph orchestration
- [LangChain Google GenAI](https://github.com/langchain-ai/langchain-google-genai) — Gemini LLM integration
- [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/) — REST API server
- [uv](https://docs.astral.sh/uv/) — Python package manager
- [pytest](https://pytest.org/) + [anyio](https://anyio.readthedocs.io/) — async testing

**Frontend:**
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [shadcn/ui](https://ui.shadcn.com/) — component library
- [Zustand](https://zustand-demo.pmnd.rs/) — state management
- [React Router](https://reactrouter.com/) — routing
- [Sonner](https://sonner.emilkowal.ski/) — toast notifications

---

## License

MIT — see [LICENSE](LICENSE)

If you want to enable LangSmith tracing, add your LangSmith API key to the `.env` file.

```text
# .env
LANGSMITH_API_KEY=lsv2...
```

3. Start the LangGraph Server.

```shell
uv run langgraph dev
```

For more information on getting started with LangGraph Server, [see here](https://langchain-ai.github.io/langgraph/tutorials/langgraph-platform/local-server/).

## How to customize

1. **Define runtime context**: Modify the `Context` class in the `graph.py` file to expose the arguments you want to configure per assistant. For example, in a chatbot application you may want to define a dynamic system prompt or LLM to use. For more information on runtime context in LangGraph, [see here](https://langchain-ai.github.io/langgraph/agents/context/?h=context#static-runtime-context).

2. **Extend the graph**: The core logic of the application is defined in [graph.py](./src/agent/graph.py). You can modify this file to add new nodes, edges, or change the flow of information.

## Development

While iterating on your graph in LangGraph Studio, you can edit past state and rerun your app from previous states to debug specific nodes. Local changes will be automatically applied via hot reload.

Follow-up requests extend the same thread. You can create an entirely new thread, clearing previous history, using the `+` button in the top right.

For more advanced features and examples, refer to the [LangGraph documentation](https://langchain-ai.github.io/langgraph/). These resources can help you adapt this template for your specific use case and build more sophisticated conversational agents.

LangGraph Studio also integrates with [LangSmith](https://smith.langchain.com/) for more in-depth tracing and collaboration with teammates, allowing you to analyze and optimize your chatbot's performance.

