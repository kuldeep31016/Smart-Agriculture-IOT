/**
 * SensorCard.jsx
 * Displays a single sensor metric (temperature / humidity / moisture)
 * with an icon, value, unit, and color-coded status badge.
 */

function SensorCard({ label, value, unit, icon, borderColor, status, statusBg, statusText }) {
  const hasValue = value !== undefined && value !== null && !isNaN(value);

  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${borderColor}
        hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 animate-fade-in`}
    >
      {/* Icon + Status */}
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

      {/* Value */}
      <p className="text-4xl font-extrabold text-gray-800 leading-none">
        {hasValue ? (
          <>
            {typeof value === 'number' ? value.toFixed(1) : value}
            <span className="text-base font-medium text-gray-400 ml-1">{unit}</span>
          </>
        ) : (
          <span className="text-gray-300 text-2xl">— No Data</span>
        )}
      </p>
    </div>
  );
}

export default SensorCard;
