import json
import sqlite3

import paho.mqtt.client as mqtt

DATABASE = "bess_telemetry.db"
TOPIC = "bess/rack-01/telemetry"


def initialize_database():
    with sqlite3.connect(DATABASE) as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS telemetry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rack_id TEXT NOT NULL,
                temperature REAL NOT NULL,
                voltage REAL NOT NULL,
                current REAL NOT NULL,
                state_of_charge REAL NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)


def on_message(client, userdata, message):
    try:
        reading = json.loads(message.payload.decode("utf-8"))

        required_fields = [
            "rack_id",
            "temperature",
            "voltage",
            "current",
            "state_of_charge",
            "timestamp",
        ]

        if not isinstance(reading, dict):
            print("Rejected: message must be a JSON object")
            return

        if not all(field in reading for field in required_fields):
            print("Rejected: missing required fields")
            return

        numeric_fields = [
            "temperature",
            "voltage",
            "current",
            "state_of_charge",
        ]

        for field in numeric_fields:
            value = reading[field]

            if isinstance(value, bool) or not isinstance(value, (int, float)):
                print(f"Rejected: {field} must be numeric")
                return

            if field in ("voltage", "current") and value < 0:
                print(f"Rejected: {field} cannot be negative")
                return

        if not 0 <= reading["state_of_charge"] <= 100:
            print("Rejected: state_of_charge must be between 0 and 100")
            return

        if not isinstance(reading["rack_id"], str) or not reading["rack_id"].strip():
            print("Rejected: rack_id must be a non-empty string")
            return

        if not isinstance(reading["timestamp"], str) or not reading["timestamp"].strip():
            print("Rejected: timestamp must be a non-empty string")
            return

        with sqlite3.connect(DATABASE) as connection:
            connection.execute("""
                INSERT INTO telemetry (
                    rack_id, temperature, voltage,
                    current, state_of_charge, timestamp
                )
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                reading["rack_id"],
                reading["temperature"],
                reading["voltage"],
                reading["current"],
                reading["state_of_charge"],
                reading["timestamp"],
            ))

        print(
            f"Stored reading for {reading['rack_id']}: "
            f"{reading['temperature']}°C"
        )

    except (json.JSONDecodeError, UnicodeDecodeError, TypeError, ValueError) as error:
        print(f"Rejected invalid message: {error}")


initialize_database()

client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="bess-telemetry-service",
)

client.on_message = on_message

client.connect("127.0.0.1", 1883, 60)
client.subscribe(TOPIC)

print(f"Listening for telemetry on {TOPIC}...")

try:
    client.loop_forever()
except KeyboardInterrupt:
    print("\nTelemetry service stopped.")
finally:
    client.disconnect()