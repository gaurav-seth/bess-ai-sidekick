import { RACK_ID } from '../data/mockData'

export default function Header({ connected = true }) {
  return (
    <header className="dashboard-header">
      <div className="header-brand">
        <span className="header-logo" aria-hidden="true">
          ⚡
        </span>
        <h1 className="header-title">BESS AI Sidekick</h1>
      </div>

      <div className="header-controls">
        <label className="rack-selector">
          <span className="rack-selector-label">Battery rack</span>
          <select className="rack-select" defaultValue={RACK_ID} aria-label="Select battery rack">
            <option value="Rack-01">Rack-01</option>
            <option value="Rack-02" disabled>
              Rack-02 (offline)
            </option>
          </select>
        </label>

        <div
          className={`connection-status ${connected ? 'connection-status--online' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className="connection-dot" aria-hidden="true" />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
          <span className="connection-meta">MQTT · simulated</span>
        </div>
      </div>
    </header>
  )
}
