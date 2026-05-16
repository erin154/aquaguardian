import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getLastNDayKeys(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

function shortDayLabel(dateKey) {
  const [y, m, day] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { weekday: 'short' })
}

function dayOfMonthLabel(dateKey) {
  return String(parseInt(dateKey.split('-')[2], 10))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #eee',
      borderRadius: 16,
      padding: '16px',
      marginBottom: 12,
      ...style,
    }}>
      {children}
    </div>
  )
}

function RangeToggle({ value, onChange }) {
  const options = [
    { key: 'today', label: 'Today' },
    { key: '7d',    label: '7 Days' },
    { key: '30d',   label: 'Month' },
    { key: '1y',    label: 'Year' },
  ]
  return (
    <div style={{
      display: 'flex',
      background: '#f0f0f0',
      borderRadius: 10,
      padding: 3,
      marginBottom: 14,
      gap: 2,
    }}>
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          style={{
            flex: 1,
            padding: '6px 0',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: value === opt.key ? 600 : 400,
            background: value === opt.key ? '#fff' : 'transparent',
            color: value === opt.key ? '#1D9E75' : '#888',
            cursor: 'pointer',
            boxShadow: value === opt.key ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Analytics Page ───────────────────────────────────────────────────────────

export default function AnalyticsPage({ allLogs, rate }) {
  const [chartRange, setChartRange] = useState('7d')

  // Group all logs by date string: { "2025-05-10": [log, ...] }
  const logsByDate = useMemo(() => {
    const map = {}
    allLogs.forEach(log => {
      if (!map[log.date]) map[log.date] = []
      map[log.date].push(log)
    })
    return map
  }, [allLogs])

  // Helper: summarize an array of logs into chart-ready object
  function summarize(dayLogs, label, isGoalComparison = true) {
    const gallons = dayLogs.reduce((s, l) => s + l.gallons, 0)
    const goal    = dayLogs.reduce((s, l) => s + l.activityGoal, 0)
    return {
      label,
      gallons: Math.round(gallons * 10) / 10,
      goal,
      hasData: dayLogs.length > 0,
      isGoalComparison,
    }
  }

  // ── Today view: group by time-of-day block ────────────────────────────────
  const todayChartData = useMemo(() => {
    const today = getTodayKey()
    const todayLogs = allLogs.filter(l => l.date === today)
    const blocks = [
      { label: 'Early',     start: 0,  end: 9  },
      { label: 'Morning',   start: 9,  end: 12 },
      { label: 'Afternoon', start: 12, end: 17 },
      { label: 'Evening',   start: 17, end: 24 },
    ]
    return blocks.map(block => {
      const blockLogs = todayLogs.filter(l => {
        const hour = new Date(l.timestamp).getHours()
        return hour >= block.start && hour < block.end
      })
      return summarize(blockLogs, block.label, false) // no goal color for time blocks
    })
  }, [allLogs])

  // ── 7-day view ────────────────────────────────────────────────────────────
  const sevenDayChartData = useMemo(() => {
    return getLastNDayKeys(7).map(dateKey => ({
      ...summarize(logsByDate[dateKey] || [], shortDayLabel(dateKey)),
      dateKey,
    }))
  }, [logsByDate])

  // ── 30-day view ───────────────────────────────────────────────────────────
  const thirtyDayChartData = useMemo(() => {
    return getLastNDayKeys(30).map(dateKey => ({
      ...summarize(logsByDate[dateKey] || [], dayOfMonthLabel(dateKey)),
      dateKey,
    }))
  }, [logsByDate])

  // ── Year view: group by calendar month ───────────────────────────────────
  const yearChartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - (11 - i))
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' })
      const monthLogs = allLogs.filter(l => l.date.startsWith(monthKey))
      return { ...summarize(monthLogs, monthLabel, false), monthKey }
    })
  }, [allLogs])

  const chartDataMap = {
    today: todayChartData,
    '7d':  sevenDayChartData,
    '30d': thirtyDayChartData,
    '1y':  yearChartData,
  }

  const chartSubtitleMap = {
    today: 'gallons so far today, by time of day',
    '7d':  'daily gallons — green = under goal',
    '30d': 'daily gallons — last 30 days',
    '1y':  'total gallons per month',
  }

  const activeChartData = chartDataMap[chartRange]

  // Bar color logic
  function barColor(d) {
    if (!d.hasData) return '#e8e8e8'
    if (!d.isGoalComparison) return '#1D9E75'          // today & year: always teal
    if (d.gallons <= d.goal)          return '#1D9E75' // under goal → green
    if (d.gallons <= d.goal * 1.25)   return '#EF9F27' // near goal  → amber
    return '#D85A30'                                    // over goal  → red
  }

  // ── Summary stats (always last 7 days) ────────────────────────────────────
  const stats = useMemo(() => {
    const daysWithData = sevenDayChartData.filter(d => d.hasData)
    const weekGallons  = sevenDayChartData.reduce((s, d) => s + d.gallons, 0)
    const daysUnder    = sevenDayChartData.filter(d => d.hasData && d.gallons <= d.goal).length
    const bestDay  = daysWithData.length ? daysWithData.reduce((b, d) => d.gallons < b.gallons ? d : b, daysWithData[0]) : null
    const worstDay = daysWithData.length ? daysWithData.reduce((b, d) => d.gallons > b.gallons ? d : b, daysWithData[0]) : null
    return { weekGallons, daysUnder, bestDay, worstDay }
  }, [sevenDayChartData])

  // ── Activity breakdown (always last 30 days) ──────────────────────────────
  const breakdown = useMemo(() => {
    const last30Keys = new Set(getLastNDayKeys(30))
    const recentLogs = allLogs.filter(l => last30Keys.has(l.date))
    const total = recentLogs.reduce((s, l) => s + l.gallons, 0)
    const map = {}
    recentLogs.forEach(log => {
      const key = log.activityLabel
      if (!map[key]) map[key] = { label: key, icon: log.activityIcon, gallons: 0 }
      map[key].gallons += log.gallons
    })
    return Object.values(map)
      .map(item => ({
        ...item,
        gallons: Math.round(item.gallons),
        pct: total > 0 ? Math.round((item.gallons / total) * 100) : 0,
      }))
      .sort((a, b) => b.gallons - a.gallons)
  }, [allLogs])

  // ── Heatmap (always last 30 days) ─────────────────────────────────────────
  const heatmap = useMemo(() => {
    return getLastNDayKeys(30).map(dateKey => {
      const dayLogs = logsByDate[dateKey] || []
      const gallons = dayLogs.reduce((s, l) => s + l.gallons, 0)
      const goal    = dayLogs.reduce((s, l) => s + l.activityGoal, 0)
      let status = 'empty'
      if (dayLogs.length > 0) {
        if (gallons <= goal)             status = 'under'
        else if (gallons <= goal * 1.25) status = 'near'
        else                             status = 'over'
      }
      return { dateKey, status }
    })
  }, [logsByDate])

  const heatColor = { empty: '#f0f0f0', under: '#1D9E75', near: '#EF9F27', over: '#D85A30' }

  const noData = allLogs.length === 0

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>📊 Your water story</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Stats & trends</div>
      </div>

      {noData ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#aaa' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💧</div>
            <div style={{ fontSize: 14 }}>Log some activities to see your stats here!</div>
          </div>
        </Card>
      ) : (
        <>
          {/* ── Summary stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'This week',      value: `${Math.round(stats.weekGallons)} gal` },
              { label: 'Days under goal', value: `${stats.daysUnder} / 7` },
              {
                label: 'Best day',
                value: stats.bestDay ? `${stats.bestDay.gallons} gal` : '—',
                sub:   stats.bestDay ? shortDayLabel(stats.bestDay.dateKey) : '',
              },
              {
                label: 'Highest day',
                value: stats.worstDay ? `${stats.worstDay.gallons} gal` : '—',
                sub:   stats.worstDay ? shortDayLabel(stats.worstDay.dateKey) : '',
                warn:  true,
              },
            ].map(s => (
              <div key={s.label} style={{ background: '#f5f5f5', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.warn ? '#D85A30' : '#1a1a1a' }}>
                  {s.value}
                </div>
                {s.sub && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* ── Toggleable bar chart ── */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Usage over time</div>
            <RangeToggle value={chartRange} onChange={setChartRange} />
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>
              {chartSubtitleMap[chartRange]}
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={activeChartData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: chartRange === '30d' ? 9 : 11, fill: '#999' }}
                  axisLine={false}
                  tickLine={false}
                  interval={chartRange === '30d' ? 4 : 0}  // avoid label crowding for month view
                />
                <YAxis tick={{ fontSize: 10, fill: '#bbb' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} gal`, 'Used']}
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
                />
                <Bar dataKey="gallons" radius={[4, 4, 0, 0]}>
                  {activeChartData.map((d, i) => (
                    <Cell key={i} fill={barColor(d)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Only show the goal legend for views that use it */}
            {(chartRange === '7d' || chartRange === '30d') && (
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {[['#1D9E75', 'Under goal'], ['#EF9F27', 'Near goal'], ['#D85A30', 'Over goal']].map(([color, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#999' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: color }} />
                    {label}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Activity breakdown (always last 30 days) ── */}
          {breakdown.length > 0 && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Top water users</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>Last 30 days</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {breakdown.map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>{item.icon} {item.label}</span>
                      <span style={{ color: '#888' }}>{item.pct}% · {item.gallons} gal</span>
                    </div>
                    <div style={{ background: '#f0f0f0', borderRadius: 4, height: 7, overflow: 'hidden' }}>
                      <div style={{
                        width: `${item.pct}%`,
                        height: '100%',
                        borderRadius: 4,
                        background: item.pct >= 40 ? '#D85A30' : item.pct >= 20 ? '#EF9F27' : '#1D9E75',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── 30-day heatmap ── */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>30-day heatmap</div>
              <div style={{ fontSize: 11, color: '#aaa' }}>Last 30 days</div>
            </div>
            <div style={{ display: 'flex', gap: 4, fontSize: 10, color: '#bbb', marginBottom: 6 }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {Array.from({ length: new Date(heatmap[0].dateKey).getDay() }, (_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {heatmap.map(({ dateKey, status }) => (
                <div
                  key={dateKey}
                  title={dateKey}
                  style={{ aspectRatio: '1', borderRadius: 4, background: heatColor[status] }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              {[['#1D9E75','Under'], ['#EF9F27','Near'], ['#D85A30','Over'], ['#f0f0f0','No data']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#999' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: color, border: '1px solid #ddd' }} />
                  {label}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}