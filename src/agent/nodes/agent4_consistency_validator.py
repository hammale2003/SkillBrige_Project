"""Agent 4 – Consistency & Gap Validator.

Purpose
-------
Cross-check each competence's updated niveau_estime for logical coherence
against the employee's experience, recent projects, and expected future levels.

Validation rules:
- niveau_estime must be consistent with experience_employee description.
- niveau_estime must not exceed niveau_attendu_24m.
- niveau_estime must not be 0 for an employee with significant experience
  unless score_test clearly justifies it.
- Prevent illogical jumps (more than ±2 vs niveau_avant_test).
- _metadata_evaluation fields (score_test, date_test) must NOT be changed.
- If a level is illogical, correct niveau_estime only.

Output: validated JSON array stored in state.validated_results.
"""

from __future__ import annotations

from typing import Any, Dict

from agent.llm import get_llm, invoke
from agent.state import State

SYSTEM_PROMPT = """You are Agent 4 – Consistency & Gap Validator of the SkillBridge system.

Cross-check each competence's updated niveau_estime for logical coherence.

Validation rules:
- Updated niveau_estime must be consistent with experience_employee description
- Updated niveau_estime must not exceed niveau_attendu_24m by more than 0
- Updated niveau_estime must not be 0 for an employee with significant experience
  unless score_test clearly justifies it
- Prevent illogical jumps (more than ±2 vs niveau_avant_test without strong justification)
- Preserve _metadata_evaluation fields exactly — do NOT change score_test or date_test
- If a level is illogical, correct niveau_estime only; leave all other fields intact

Return ONLY a valid JSON array of competences with the same structure as the input.
No markdown. No explanation. Only the JSON array.
"""


async def consistency_gap_validator(state: State) -> Dict[str, Any]:
    """Agent 4: validate and correct levels for logical coherence."""
    llm = get_llm()
    result = await invoke(
        llm,
        SYSTEM_PROMPT,
        f"Original employee profile:\n{state.employee_json}\n\n"
        f"Evaluated competences JSON array:\n{state.evaluation_results}",
    )
    result = (
        result.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )
    return {"validated_results": result}
