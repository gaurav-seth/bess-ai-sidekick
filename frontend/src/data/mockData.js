export const RACK_ID = 'Rack-01'

export const liveMetrics = {
  temperature: 28.4,
  voltage: 402.6,
  current: -12.3,
  stateOfCharge: 78.2,
}

/** Last 12 hourly samples for charting */
export const telemetryHistory = [
  { time: '06:00', temperature: 24.1, voltage: 405.2, current: -8.5, stateOfCharge: 92.1 },
  { time: '07:00', temperature: 25.0, voltage: 404.8, current: -15.2, stateOfCharge: 89.4 },
  { time: '08:00', temperature: 26.2, voltage: 404.1, current: -22.0, stateOfCharge: 86.8 },
  { time: '09:00', temperature: 27.1, voltage: 403.5, current: -18.6, stateOfCharge: 84.2 },
  { time: '10:00', temperature: 27.8, voltage: 403.0, current: -10.1, stateOfCharge: 82.5 },
  { time: '11:00', temperature: 28.0, voltage: 402.8, current: 4.2, stateOfCharge: 81.0 },
  { time: '12:00', temperature: 28.6, voltage: 402.4, current: 12.8, stateOfCharge: 80.1 },
  { time: '13:00', temperature: 29.2, voltage: 402.2, current: 8.5, stateOfCharge: 79.4 },
  { time: '14:00', temperature: 29.0, voltage: 402.5, current: -5.0, stateOfCharge: 78.9 },
  { time: '15:00', temperature: 28.7, voltage: 402.6, current: -12.3, stateOfCharge: 78.2 },
  { time: '16:00', temperature: 28.3, voltage: 402.7, current: -14.1, stateOfCharge: 77.6 },
  { time: '17:00', temperature: 27.9, voltage: 402.9, current: -11.0, stateOfCharge: 77.0 },
]

export const chartSeries = [
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#f59e0b' },
  { key: 'voltage', label: 'Voltage', unit: 'V', color: '#22d3ee' },
  { key: 'current', label: 'Current', unit: 'A', color: '#60a5fa' },
  { key: 'stateOfCharge', label: 'State of Charge', unit: '%', color: '#34d399' },
]

export const initialChatMessages = [
  {
    id: '1',
    role: 'user',
    content: 'How is Rack-01 performing right now?',
    timestamp: '15:42',
  },
  {
    id: '2',
    role: 'assistant',
    content:
      'Rack-01 is operating within normal parameters. State of charge is 78.2% with voltage at 402.6 V. Temperature is 28.4 °C, slightly elevated but within the expected range for afternoon load. Discharge current of −12.3 A indicates moderate export. No immediate anomalies detected; continue routine monitoring.',
    timestamp: '15:42',
  },
]
