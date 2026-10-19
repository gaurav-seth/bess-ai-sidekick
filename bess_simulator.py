
import random
import time
import json
from datetime import datetime, timezone

import paho.mqtt.client as mqtt

battery = {
    "rack_id": "Rack-01",
    "temperature": 32.0,
    "voltage": 400.0,
    "current": 20.0,
    "state_of_charge": 80.0,
}

# Connect the simulator to our local MQTT broker
client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="bess-simulator"
)

client.connect("127.0.0.1", 1883, 60)
client.loop_start()


def generate_battery_reading():
    """Generate simulated battery readings."""

    battery["temperature"] += random.uniform(-0.3, 0.3)
    battery["voltage"] += random.uniform(-0.5, 0.5)
    battery["current"] += random.uniform(-1.0, 1.0)

    battery["current"] = round(
        max(0.0, min(50.0, battery["current"])), 2
    )

    battery["state_of_charge"] -= battery["current"] * 0.0005
    battery["state_of_charge"] = max(
        0.0, min(100.0, battery["state_of_charge"])
    )

    battery["temperature"] = round(battery["temperature"], 2)
    battery["voltage"] = round(battery["voltage"], 2)
    battery["state_of_charge"] = round(
        battery["state_of_charge"], 2
    )

    return {
        **battery,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


if __name__ == "__main__":
    try:
        while True:
            reading = generate_battery_reading()

            # Publish the reading as a JSON message
            payload = json.dumps(reading)
            client.publish("bess/rack-01/telemetry", payload)

            print(f"Published: {payload}")
            time.sleep(5)

    except KeyboardInterrupt:
        print("\nStopping BESS simulator...")

    finally:
        client.loop_stop()
        client.disconnect()
