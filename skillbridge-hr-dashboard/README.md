# SkillBridge HR Dashboard

React + TypeScript frontend for the [SkillBridge](https://github.com/hammale2003/SkillBrige_Project) multi-agent competency evaluation system.

---

## Features

- **Dashboard** — Employee cards with competence levels, score bars, formation recommendations
- **Evaluation Page** — Launch QCM generation with live agent stepper and console log
- **Test Session** — One QCM per competence with syntax-highlighted code blocks, auto-scored on submit
- **Auto-save** — Evaluated employees are automatically added to the Dashboard
- **Export** — Download evaluation results as JSON

---

## Setup

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`. Requires the [SkillBridge backend](https://github.com/hammale2003/SkillBrige_Project) running at `http://localhost:8000`.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — list of evaluated employees |
| `/evaluation` | Upload profile JSON, launch evaluation |
| `/test-session` | Answer QCM questions per competence |

---

## Workflow

```
Dashboard → "Nouvelle Evaluation" → upload input.json
    → Evaluation page → "Generer les questions"
    → Backend: Agent 1 (analysis) + Agent 2 (QCM generation)
    → TestSession: answer A/B/C/D per competence
    → Submit → Backend: Agent 1 + 3 (scoring) + 4 (validation) + 5 (JSON output)
    → Back to Evaluation: results displayed + employee auto-saved to Dashboard
```

---

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Zustand (state management)
- React Router v6

---

## Backend

**Repository:** [hammale2003/SkillBrige_Project](https://github.com/hammale2003/SkillBrige_Project)

The backend exposes a single endpoint:

```
POST http://localhost:8000/api/evaluate
{
  "employee_json": "...",
  "mode": "generate_tests" | "evaluate" | "simulate",
  "test_scores": { "COMP_001": 20, ... }
}
```
