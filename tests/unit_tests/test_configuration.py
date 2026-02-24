import dataclasses

from langgraph.pregel import Pregel

from src.agent.graph import graph
from src.agent.state import State


def test_graph_is_pregel() -> None:
    """Graph must compile to a valid Pregel instance."""
    assert isinstance(graph, Pregel)


def test_state_fields() -> None:
    """State must expose all 8 expected fields."""
    field_names = {f.name for f in dataclasses.fields(State)}
    required = {
        "employee_json",
        "mode",
        "test_scores",
        "analysis",
        "test_blueprint",
        "evaluation_results",
        "validated_results",
        "final_output",
    }
    assert required.issubset(field_names), f"Missing fields: {required - field_names}"


def test_state_defaults() -> None:
    """State default values must be sensible."""
    s = State()
    assert s.mode == "simulate"
    assert s.test_scores == {}
    assert s.employee_json == ""
    assert s.final_output == ""
