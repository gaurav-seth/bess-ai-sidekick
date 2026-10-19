
import sqlite3

DATABASE = "bess_telemetry.db"


def get_latest_reading(rack_id="Rack-01"):
    """Return the latest stored reading for a battery rack."""

    with sqlite3.connect(DATABASE) as connection:
        connection.row_factory = sqlite3.Row

        row = connection.execute(
            """
            SELECT rack_id, temperature, voltage,
                   current, state_of_charge, timestamp
            FROM telemetry
            WHERE rack_id = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (rack_id,),
        ).fetchone()

    if row is None:
        return None

    return dict(row)


def get_recent_readings(rack_id="Rack-01", limit=10):
    """Return the most recent readings for a battery rack."""

    with sqlite3.connect(DATABASE) as connection:
        connection.row_factory = sqlite3.Row

        rows = connection.execute(
            """
            SELECT rack_id, temperature, voltage,
                   current, state_of_charge, timestamp
            FROM telemetry
            WHERE rack_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (rack_id, limit),
        ).fetchall()

    return [dict(row) for row in rows]


def get_average_temperature(rack_id="Rack-01", limit=10):
    """Calculate average temperature across recent readings."""

    readings = get_recent_readings(rack_id, limit)

    if not readings:
        return None

    average = sum(
        reading["temperature"] for reading in readings
    ) / len(readings)

    return round(average, 2)


if __name__ == "__main__":
    #reading = get_latest_reading()

    #if reading is None:
    #    print("No readings found.")
    #else:
    #    print(reading)

    #readings = get_recent_readings()  # pyright: ignore[reportUndefinedVariable]

    #print(f"Total readings returned: {len(readings)}")

    #for reading in readings:
    #    print(reading)

    average_temperature = get_average_temperature()
    print(f"Average temperature: {average_temperature}")
    