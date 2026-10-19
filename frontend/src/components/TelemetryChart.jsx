
import { useEffect, useState } from 'react'
import { chartSeries } from '../data/mockData'

const CHART = {
  width: 720,
  height: 260,
  pad: { top: 16, right: 48, bottom: 36, left: 48 },
}

function scaleSeries(values, innerHeight) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values.map(
    (v) => CHART.pad.top + innerHeight - ((v - min) / span) * innerHeight
  )
}

function buildPath(xs, ys) {
  return xs
    .map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${ys[i].toFixed(2)}`)
    .join(' ')
}

export default function TelemetryChart() {
  const [telemetryHistory, setTelemetryHistory] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(
          'http://localhost:8000/telemetry/history?limit=20'
        )

        if (!response.ok) {
          throw new Error(`API request failed (${response.status})`)
        }

        const data = await response.json()
        setTelemetryHistory(
          data.readings.map((reading) => ({
            time: new Date(reading.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            temperature: reading.temperature,
            voltage: reading.voltage,
            current: reading.current,
            stateOfCharge: reading.state_of_charge,
          }))
        )
        setError('')
      } catch {
        setError('Unable to load telemetry history.')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
    const intervalId = setInterval(fetchHistory, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const innerWidth = CHART.width - CHART.pad.left - CHART.pad.right
  const innerHeight = CHART.height - CHART.pad.top - CHART.pad.bottom

  if (loading) return <p>Loading telemetry history...</p>
  if (error && telemetryHistory.length === 0) {
    return <p role="alert">{error}</p>
  }
  if (telemetryHistory.length === 0) {
    return <p>No telemetry history available.</p>
  }

  const n = telemetryHistory.length
  const xs = telemetryHistory.map(
    (_, i) => CHART.pad.left + (n === 1 ? 0 : (i / (n - 1)) * innerWidth)
  )

  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <section className="chart-panel" aria-labelledby="telemetry-chart-title">
      <div className="chart-panel-header">
        <div>
          <h2 id="telemetry-chart-title" className="panel-title">
            Historical telemetry
          </h2>
          <p className="panel-subtitle">
            Recent readings · normalized per metric for comparison
          </p>
        </div>
      </div>

      <figure className="chart-figure">
        <svg
          className="telemetry-chart"
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          role="img"
          aria-label="Line chart of temperature, voltage, current, and state of charge over time"
        >
          <defs>
            <linearGradient id="chartGridFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          <rect
            x={CHART.pad.left}
            y={CHART.pad.top}
            width={innerWidth}
            height={innerHeight}
            fill="url(#chartGridFade)"
            rx="4"
          />

          {yTicks.map((t) => {
            const y = CHART.pad.top + innerHeight * (1 - t)
            return (
              <g key={t}>
                <line
                  x1={CHART.pad.left}
                  y1={y}
                  x2={CHART.pad.left + innerWidth}
                  y2={y}
                  className="chart-grid-line"
                />
                <text
                  x={CHART.pad.left - 8}
                  y={y + 4}
                  className="chart-axis-y"
                  textAnchor="end"
                >
                  {Math.round(t * 100)}%
                </text>
              </g>
            )
          })}

          {telemetryHistory.map((point, i) => (
            <text
              key={`${point.time}-${i}`}
              x={xs[i]}
              y={CHART.height - 8}
              className="chart-axis-x"
              textAnchor="middle"
            >
              {point.time}
            </text>
          ))}

          <text
            x={CHART.pad.left + innerWidth / 2}
            y={CHART.height - 22}
            className="chart-axis-label"
            textAnchor="middle"
          >
            Time (local)
          </text>

          <text
            x={14}
            y={CHART.pad.top + innerHeight / 2}
            className="chart-axis-label"
            textAnchor="middle"
            transform={`rotate(-90, 14, ${CHART.pad.top + innerHeight / 2})`}
          >
            Normalized scale
          </text>

          {chartSeries.map((series) => {
            const values = telemetryHistory.map((row) => row[series.key])
            const ys = scaleSeries(values, innerHeight)

            return (
              <path
                key={series.key}
                d={buildPath(xs, ys)}
                fill="none"
                stroke={series.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        <figcaption className="chart-legend">
          {chartSeries.map((series) => {
            const latest = telemetryHistory[telemetryHistory.length - 1][series.key]
            const formatted =
              series.key === 'stateOfCharge'
                ? `${latest.toFixed(1)}%`
                : series.key === 'voltage'
                  ? `${latest.toFixed(1)} V`
                  : series.key === 'temperature'
                    ? `${latest.toFixed(1)} °C`
                    : `${latest.toFixed(1)} A`

            return (
              <div key={series.key} className="legend-item">
                <span
                  className="legend-swatch"
                  style={{ backgroundColor: series.color }}
                />
                <span className="legend-label">
                  {series.label} ({series.unit})
                </span>
                <span className="legend-value">{formatted}</span>
              </div>
            )
          })}
        </figcaption>
      </figure>
    </section>
  )
}
