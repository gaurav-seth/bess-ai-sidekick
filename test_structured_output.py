
from langchain_ollama import ChatOllama
from bess_schemas import BESSAnalysis

llm = ChatOllama(
    model="qwen2.5:3b-instruct",
    temperature=0,
)

structured_llm = llm.with_structured_output(
    BESSAnalysis,
    method="json_mode",
)

result = structured_llm.invoke(
    """
    Return a structured BESS analysis for Rack-01.

    Facts:
    - Temperature increased by 0.16 degrees Celsius.
    - Voltage decreased by 0.24 volts.
    - Current decreased by 0.57 amperes.
    - State of charge decreased by 0.01 percentage points.

    Return all required fields in the BESSAnalysis schema.
    Use only these facts. Do not claim that these small changes
    establish a safety problem.

    JSON schema:
    """
    + str(BESSAnalysis.model_json_schema())
)

print(result.model_dump_json(indent=2))
