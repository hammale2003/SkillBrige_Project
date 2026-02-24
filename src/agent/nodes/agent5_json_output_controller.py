"""Agent 5 – JSON Output Controller.

Purpose
-------
Reconstruct the complete, final output JSON from the original employee record
and the validated competences array.

Absolute constraints:
- Only niveau_estime and _metadata_evaluation may change.
- All other fields (employee_id, employee_name, poste, projets, objectifs,
  formations, metadata, competence_id, titre, detail, experience_employee,
  niveau_attendu_*) must remain exactly as in the input.
- No new top-level fields.
- No reordering of keys.
- No comments or markdown fences.
- Output is ONLY the raw JSON string.

Output: final valid JSON string stored in state.final_output.
"""

from __future__ import annotations

from typing import Any, Dict

from agent.llm import get_llm, invoke
from agent.state import State

SYSTEM_PROMPT = """You are Agent 5 – JSON Output Controller of the SkillBridge system.

Your only task: reconstruct the complete, final output JSON.

Rules (ABSOLUTE):
- Start from the original employee JSON structure
- Replace niveau_estime in each competence with the validated value
- Inject _metadata_evaluation into each competence from the validated array
- Do NOT modify any other field (employee_id, employee_name, poste, projets,
  objectifs, formations, metadata, competence_id, titre, detail, experience_employee,
  niveau_attendu_*)
- Do NOT add new top-level fields
- Do NOT reorder keys
- Do NOT add comments
- Do NOT add markdown fences
- Output ONLY the raw JSON string. Nothing else.
"""


async def json_output_controller(state: State) -> Dict[str, Any]:
    """Agent 5: reconstruct and return the final valid JSON output."""
    llm = get_llm()
    result = await invoke(
        llm,
        SYSTEM_PROMPT,
        f"Original employee JSON:\n{state.employee_json}\n\n"
        f"Validated competences JSON array (use these values):\n{state.validated_results}",
    )
    result = (
        result.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )
    return {"final_output": result}
