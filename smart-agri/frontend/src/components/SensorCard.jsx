// SensorCard: displays a single sensor metric with value, unit, status, and min/max

export default function SensorCard({
  label, value, unit, icon, borderColor,
  status, statusBg, statusText,
  min, max,
}) {
  const hasValue = value !== undefined && value !== null && !isNaN(Number(value));

  return (
    <div className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${borderColor}
      hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}>

      {/* Icon + Status badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusBg} ${statusText}`}>
          {status}
        </span>
      </div>

      {/* Label */}
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
        {label}
      </p>

      {/* Main value */}
      <p className="text-4xl font-extrabold text-gray-800 leading-none">
        {hasValue ? (
          <>
            {Number(value).toFixed(1)}
            <span className="text-base font-medium text-gray-400 ml-1">{unit}</span>
          </>
        ) : (
          <span className="text-gray-300 text-2xl">— No Data</span>
        )}
      </p>

      {/* Min / Max row */}
      {(min !== undefined || max !== undefined) && (
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          {min !== undefined && (
            <span>↓ Min <span className="font-semibold text-gray-700">{Number(min).toFixed(1)}{unit}</span></span>
          )}
          {max !== undefined && (
            <span>↑ Max <span className="font-semibold text-gray-700">{Number(max).toFixed(1)}{unit}</span></span>
          )}
        </div>
      )}
    </div>
  );
}
