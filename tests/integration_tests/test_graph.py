import json
import pathlib

import pytest

from agent import graph

pytestmark = pytest.mark.anyio

# Load the shared employee fixture once
_INPUT_PATH = pathlib.Path(__file__).parents[2].parent / "input.json"
_EMPLOYEE_JSON: str = _INPUT_PATH.read_text(encoding="utf-8") if _INPUT_PATH.exists() else "{}"


@pytest.mark.langsmith
async def test_simulate_mode() -> None:
    """simulate mode must return a fully populated, valid JSON output."""
    res = await graph.ainvoke({"employee_json": _EMPLOYEE_JSON, "mode": "simulate"})
    assert res["final_output"], "final_output must not be empty"
    data = json.loads(res["final_output"])
    assert "employee_id" in data
    for comp in data["competences"]:
        meta = comp.get("_metadata_evaluation", {})
        assert "score_test" in meta
        assert "date_test" in meta
        assert "niveau_avant_test" in meta


@pytest.mark.langsmith
async def test_generate_tests_mode() -> None:
    """generate_tests mode must return a test blueprint and leave final_output empty."""
    res = await graph.ainvoke({"employee_json": _EMPLOYEE_JSON, "mode": "generate_tests"})
    assert res["test_blueprint"], "test_blueprint must not be empty"
    assert res.get("final_output", "") == "", "final_output must be empty in generate_tests mode"


@pytest.mark.langsmith
async def test_evaluate_mode_with_real_scores() -> None:
    """evaluate mode with real scores must use provided values in _metadata_evaluation."""
    real_scores = {"COMP_001": 13, "COMP_002": 0, "COMP_003": 0}
    res = await graph.ainvoke(
        {
            "employee_json": _EMPLOYEE_JSON,
            "mode": "evaluate",
            "test_scores": real_scores,
        }
    )
    assert res["final_output"], "final_output must not be empty"
    data = json.loads(res["final_output"])
    for comp in data["competences"]:
        cid = comp["competence_id"]
        if cid in real_scores:
            assert comp["_metadata_evaluation"]["score_test"] == real_scores[cid], (
                f"{cid}: expected score {real_scores[cid]}, "
                f"got {comp['_metadata_evaluation']['score_test']}"
            )
