// SensorCard: displays a single sensor metric with value, unit, status, and min/max

export default function SensorCard({
  label, value, unit, icon,
  status, statusBg, statusText,
  min, max,
}) {
  const hasValue = value !== undefined && value !== null && !isNaN(Number(value));

  let svgIcon = null;
  if (label === 'Temperature') svgIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>;
  else if (label === 'Humidity') svgIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>;
  else if (label === 'Moisture') svgIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h4a1 1 0 0 1 1 1v1h1v-1a1 1 0 0 1 1-1h4a2 2 0 0 1 2 2v5a7 7 0 0 1-7 7z"></path></svg>;

  return (
    <div className={`bg-white rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 border border-gray-100/80 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group`}>
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className={`p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm group-hover:scale-110 group-hover:bg-gray-100 transition-all duration-300`}>
          {svgIcon || icon}
        </div>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${statusBg} ${statusText} tracking-wide border shadow-sm`}>
          {status}
        </span>
      </div>

      <div className="relative z-10">
        <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">
          {label}
        </p>

        <p className="text-4xl font-bold text-gray-900 tracking-tight leading-none mb-5 transition-transform transform origin-left group-hover:scale-105 duration-500">
          {hasValue ? (
            <>
              {Number(value).toFixed(1)}
              <span className="text-xl font-semibold text-gray-400 ml-1.5">{unit}</span>
            </>
          ) : (
            <span className="text-gray-300 text-2xl">—</span>
          )}
        </p>

        {(min !== undefined || max !== undefined) && (
          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium pt-4 border-t border-gray-100">
            {min !== undefined && (
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                {Number(min).toFixed(1)}<span className="text-[10px]">{unit}</span>
              </span>
            )}
            {max !== undefined && (
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                {Number(max).toFixed(1)}<span className="text-[10px]">{unit}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
