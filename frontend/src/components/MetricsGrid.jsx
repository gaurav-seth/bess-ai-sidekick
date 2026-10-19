
import { useEffect, useState } from 'react'
import MetricCard from './MetricCard'

export default function MetricsGrid() {
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch(
          'http://localhost:8000/telemetry/latest'
        )

        if (!response.ok) {
          throw new Error(`API request failed (${response.status})`)
        }

        const data = await response.json()
        setMetrics(data)
        setError('')
      } catch (err) {
        setError('Unable to load live telemetry.')
      }
    }

    fetchMetrics()
    const intervalId = setInterval(fetchMetrics, 5000)

    return () => clearInterval(intervalId)
  }, [])

  if (error && !metrics) {
    return <p role="alert">{error}</p>
  }

  if (!metrics) {
    return <p>Loading live telemetry...</p>
  }

  const { temperature, voltage, current, state_of_charge } = metrics

  return (
    <section className="metrics-grid" aria-label="Live rack metrics">
      <MetricCard
        label="Temperature"
        value={temperature.toFixed(2)}
        unit="°C"
        hint="Latest recorded reading"
        variant="amber"
      />
      <MetricCard
        label="Voltage"
        value={voltage.toFixed(2)}
        unit="V"
        hint="DC bus voltage"
        variant="cyan"
      />
      <MetricCard
        label="Current"
        value={current > 0 ? `+${current.toFixed(2)}` : current.toFixed(2)}
        unit="A"
        hint={current < 0 ? 'Discharging' : 'Charging'
        }
        variant="blue"
      />
      <MetricCard
        label="State of Charge"
        value={state_of_charge.toFixed(2)}
        unit="%"
        hint="Estimated SOC"
        variant="green"
      />
    </section>
  )
}
