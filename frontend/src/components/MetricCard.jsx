export default function MetricCard({ label, value, unit, hint, variant = 'default' }) {
  return (
    <article className={`metric-card metric-card--${variant}`}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">
        <span className="metric-number">{value}</span>
        <span className="metric-unit">{unit}</span>
      </p>
      {hint ? <p className="metric-hint">{hint}</p> : null}
    </article>
  )
}
