// LiveChart: Line chart, Bar chart, and Area chart for sensor data
// Recharts-based visualization of IoT sensor readings

import {
  LineChart, Line,
  BarChart, Bar, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#f0faf4',
    border: '1px solid #52b788',
    borderRadius: '10px',
    fontSize: '13px',
  },
};

function fmt(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

export default function LiveChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-2">
        <span className="text-5xl">📡</span>
        <p className="font-medium">No sensor data yet</p>
        <p className="text-sm">Run <code className="bg-gray-100 px-2 py-0.5 rounded">python main.py</code> to start streaming</p>
      </div>
    );
  }

  // Chart expects oldest on left, newest on right
  const chartData = [...data].reverse().map(d => ({
    time: fmt(d.timestamp),
    Temperature: parseFloat((d.temperature || 0).toFixed(1)),
    Humidity: parseFloat((d.humidity || 0).toFixed(1)),
    Moisture: parseFloat(((d.moisture ?? d.soil ?? 0) || 0).toFixed(1)),
  }));

  const latest = chartData[chartData.length - 1] || {};
  const barData = [
    { name: 'Temperature', value: latest.Temperature || 0, fill: '#ef4444' },
    { name: 'Humidity', value: latest.Humidity || 0, fill: '#3b82f6' },
    { name: 'Moisture', value: latest.Moisture || 0, fill: '#22c55e' },
  ];

  return (
    <div className="space-y-8">
      {/* ── Line Chart: all 3 sensors ──────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100/80 p-8 pt-10">
        <h3 className="text-[1.15rem] font-bold text-gray-900 flex items-center gap-3 tracking-tight mb-8">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
          Sensor Trends — Last {data.length} Readings
        </h3>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e9" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }} />
            <Line type="monotone" dataKey="Temperature" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="Humidity" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="Moisture" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bar Chart: current snapshot ────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100/80 p-8 pt-10">
        <h3 className="text-[1.15rem] font-bold text-gray-900 flex items-center gap-3 tracking-tight mb-8">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500/80"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M7 21v-4" /><path d="M12 21v-8" /><path d="M17 21v-12" /></svg>
          Current Reading Snapshot
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip {...tooltipStyle} formatter={(v, n) => [`${v}`, n]} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={80}>
              {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Area Chart: moisture trend ──────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100/80 p-8 pt-10">
        <h3 className="text-[1.15rem] font-bold text-gray-900 flex items-center gap-3 tracking-tight mb-8">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/80"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          Soil Moisture Trend
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e9" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="Moisture" stroke="#22c55e" strokeWidth={2} fill="url(#moistureGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
