
from pydantic import BaseModel, Field


class BESSAnalysis(BaseModel):
    """Standardized response from the BESS AI Sidekick."""

    rack_id: str = Field(
        description="The battery rack being analyzed"
    )

    summary: str = Field(
        description="A concise summary of the findings"
    )

    observations: list[str] = Field(
        description="Observations supported by retrieved telemetry"
    )

    potential_concerns: list[str] = Field(
        description="Potential issues that may need investigation"
    )

    recommended_checks: list[str] = Field(
        description="Suggested checks for an operator to review"
    )
