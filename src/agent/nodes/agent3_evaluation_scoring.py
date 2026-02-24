"""Agent 3 – Evaluation & Scoring Agent.

Purpose
-------
Evaluate test results and convert raw scores into updated skill levels.

Two internal modes:
  - simulate : scores are derived from the test blueprint and employee profile.
  - real     : scores come from state.test_scores (provided by the frontend).

Scoring scale (score_test 0–20 → niveau_estime 0–5):
  0–4   → 0
  5–8   → 1  (or 2 if strong experience)
  9–11  → 2  (or 3 if strong experience)
  12–14 → 3  (or 4 if strong experience)
  15–17 → 4
  18–20 → 5

Output: JSON array of competences with _metadata_evaluation injected,
stored in state.evaluation_results.
"""

from __future__ import annotations

import json
from typing import Any, Dict

from agent.llm import get_llm, invoke
from agent.state import State

_SYSTEM_SIMULATE = """You are Agent 3 – Evaluation & Scoring Agent of the SkillBridge system.

Simulate a realistic evaluation of the employee based on their profile and test blueprint.

Rules:
- score_test is on a 0–20 scale, consistent with the difficulty and employee experience
- niveau_estime is on a 0–5 scale derived from score_test:
    0–4   → 0
    5–8   → 1  (or 2 if strong experience)
    9–11  → 2  (or 3 if strong experience)
    12–14 → 3  (or 4 if strong experience)
    15–17 → 4
    18–20 → 5
- niveau_avant_test must be the original niveau_estime from the input JSON
- date_test must be the evaluation_date from the input JSON
- Do NOT invent unrealistic level jumps (max ±2 from niveau_avant_test)

Return ONLY a valid JSON array of competences — same structure as the input
competences array, with:
  • niveau_estime updated
  • _metadata_evaluation added:
    { "score_test": <int>, "date_test": "<YYYY-MM-DD>", "niveau_avant_test": <int> }

No markdown. No explanation. Only the JSON array.
"""

_SYSTEM_REAL = """You are Agent 3 – Evaluation & Scoring Agent of the SkillBridge system.

You have been given REAL test scores collected from the employee.

Rules:
- score_test values come EXACTLY from the provided scores dict
- niveau_estime is on a 0–5 scale derived from score_test:
    0–4   → 0
    5–8   → 1  (or 2 if strong experience)
    9–11  → 2  (or 3 if strong experience)
    12–14 → 3  (or 4 if strong experience)
    15–17 → 4
    18–20 → 5
- niveau_avant_test must be the original niveau_estime from the input JSON
- date_test must be the evaluation_date from the input JSON
- Do NOT invent unrealistic level jumps (max ±2 from niveau_avant_test)

Return ONLY a valid JSON array of competences — same structure as the input
competences array, with:
  • niveau_estime updated
  • _metadata_evaluation added:
    { "score_test": <int>, "date_test": "<YYYY-MM-DD>", "niveau_avant_test": <int> }

No markdown. No explanation. Only the JSON array.
"""


async def evaluation_scoring_agent(state: State) -> Dict[str, Any]:
    """Agent 3: score tests and derive updated niveau_estime."""
    llm = get_llm()

    if state.test_scores:
        system = _SYSTEM_REAL
        human = (
            f"Employee profile:\n{state.employee_json}\n\n"
            f"Context analysis:\n{state.analysis}\n\n"
            f"Real test scores (competence_id → score_test):\n"
            f"{json.dumps(state.test_scores, ensure_ascii=False)}"
        )
    else:
        system = _SYSTEM_SIMULATE
        human = (
            f"Employee profile:\n{state.employee_json}\n\n"
            f"Context analysis:\n{state.analysis}\n\n"
            f"Test blueprint:\n{state.test_blueprint}"
        )

    result = await invoke(llm, system, human)
    result = (
        result.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )
    return {"evaluation_results": result}
