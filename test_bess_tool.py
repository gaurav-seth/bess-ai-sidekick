
from bess_tools import get_battery_reading

result = get_battery_reading.invoke({
    "rack_id": "Rack-01"
})

print("Tool result:")
print(result)
