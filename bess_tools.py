
from langchain.tools import tool

from telemetry_store import get_latest_reading

from telemetry_store import get_recent_readings


@tool
def get_battery_reading(rack_id: str = "Rack-01") -> dict:
    """Get the latest actual telemetry reading for a BESS battery rack.

    Use this tool when asked about the current temperature, voltage,
    current, or state of charge of a battery rack.
    """
    reading = get_latest_reading(rack_id)

    if reading is None:
        return {"error": f"No readings found for {rack_id}"}

    return reading

@tool
def get_battery_history(rack_id: str = "Rack-01", limit: int = 10) -> list[dict]:
    """Get the historical telemetry readings for a BESS battery rack.

    Use this tool when asked about the temperature, voltage, current,
    or state of charge of a battery rack over time.
    """
    readings = get_recent_readings(rack_id, limit)

    return readings


@tool
def compare_latest_readings(rack_id: str = "Rack-01") -> dict:
    """Compare the latest two telemetry readings for a battery rack.

    Use this tool to identify whether temperature, voltage, current,
    or state of charge increased or decreased since the previous reading.
    This tool compares readings; it does not determine equipment safety.
    """
    readings = get_recent_readings(rack_id, limit=2)

    if len(readings) < 2:
        return {"error": "Not enough readings to compare."}

    latest = readings[0]
    previous = readings[1]

    metrics = [
        "temperature",
        "voltage",
        "current",
        "state_of_charge",
    ]

    comparison = {}

    for metric in metrics:
        difference = round(
            latest[metric] - previous[metric], 2
        )

        comparison[metric] = {
            "previous": previous[metric],
            "latest": latest[metric],
            "difference": difference,
            "direction": (
                "increased" if difference > 0
                else "decreased" if difference < 0
                else "unchanged"
            ),
        }

    return comparison
