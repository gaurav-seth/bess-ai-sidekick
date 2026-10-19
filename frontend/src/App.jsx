import Header from './components/Header'
import MetricsGrid from './components/MetricsGrid'
import TelemetryChart from './components/TelemetryChart'
import ChatPanel from './components/ChatPanel'
import './App.css'

function App() {
  return (
    <div className="dashboard">
      <Header connected />
      <main className="dashboard-main">
        <div className="dashboard-primary">
          <MetricsGrid />
          <TelemetryChart />
        </div>
        <ChatPanel />
      </main>
      <footer className="dashboard-footer">
        <span>BESS AI Sidekick · mock data preview</span>
        <span>Rack-01 · {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
      </footer>
    </div>
  )
}

export default App
