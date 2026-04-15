/**
 * LiveChart.jsx
 * Renders two Recharts charts:
 *   1. LineChart — trend of all 3 sensors over last 20 readings
 *   2. BarChart  — current snapshot comparison
 */

import {
  LineChart, Line,
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Tooltip style shared between charts
const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#f0faf4',
    border:          '1px solid #52b788',
    borderRadius:    '10px',
    fontSize:        '13px',
  },
};

function LiveChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-2">
        <span className="text-5xl">📡</span>
        <p className="font-medium">No sensor data yet</p>
        <p className="text-sm">Run <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">python iot_sender.py</code> to start sending data</p>
      </div>
    );
  }

  const withMoisture = data.map((d) => ({
    ...d,
    moisture: d.moisture ?? d.soil ?? d.soil_moisture ?? d.soilMoisture ?? d.sm,
  }));

  // Build line chart data — reverse so oldest is left, newest is right
  const lineData = [...withMoisture].reverse().map((d) => ({
    time:        new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    Temperature: parseFloat(d.temperature?.toFixed(1)) || 0,
    Humidity:    parseFloat(d.humidity?.toFixed(1))    || 0,
    Moisture:    parseFloat(d.moisture?.toFixed(1))    || 0,
  }));

  // Build bar chart data from latest reading
  const latest = withMoisture[0];
  const barData = [
    { name: 'Temperature', value: parseFloat(latest.temperature?.toFixed(1)) || 0, fill: '#ef4444' },
    { name: 'Humidity',    value: parseFloat(latest.humidity?.toFixed(1))    || 0, fill: '#3b82f6' },
    { name: 'Moisture',    value: parseFloat(latest.moisture?.toFixed(1))    || 0, fill: '#22c55e' },
  ];

  return (
    <div className="space-y-10">

      {/* ── Line Chart ─────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-bold text-agri-primary mb-4 flex items-center gap-2">
          <span>📈</span> Sensor Trends — Last {data.length} Readings
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e9" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }} />
            <Line
              type="monotone" dataKey="Temperature"
              stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
            />
            <Line
              type="monotone" dataKey="Humidity"
              stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
            />
            <Line
              type="monotone" dataKey="Moisture"
              stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bar Chart ──────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-bold text-agri-primary mb-4 flex items-center gap-2">
          <span>📊</span> Current Reading Snapshot
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2e9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value, name) => [`${value} %`, name]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={80}>
              {barData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default LiveChart;
