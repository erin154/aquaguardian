import SpiritWidget   from '../components/SpiritWidget'
import InsightCard    from '../components/InsightCard'
import ActivityLogger from '../components/ActivityLogger'
import LogHistory     from '../components/LogHistory'

export default function DashboardPage({ health, streak, logs, rate, onLog, onChallengeComplete }) {
  return (
    <>
      <SpiritWidget health={health} streak={streak} onChallengeComplete={onChallengeComplete} />
      {logs.length > 0 && <InsightCard logs={logs} rate={rate} streak={streak} />}
      <ActivityLogger onLog={onLog} />
      <LogHistory logs={logs} />
    </>
  )
}