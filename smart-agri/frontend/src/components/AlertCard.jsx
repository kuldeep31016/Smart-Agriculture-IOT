// AlertCard: displays a single sensor alert with type, value, and recommended action

const CONFIG = {
  critical: {
    bg:     'bg-red-50',
    border: 'border-red-300',
    badge:  'bg-red-100 text-red-700',
    icon:   '🔴',
  },
  warning: {
    bg:     'bg-yellow-50',
    border: 'border-yellow-300',
    badge:  'bg-yellow-100 text-yellow-700',
    icon:   '🟡',
  },
  normal: {
    bg:     'bg-green-50',
    border: 'border-green-300',
    badge:  'bg-green-100 text-green-700',
    icon:   '🟢',
  },
};

export default function AlertCard({ type, sensor, value, unit, message, action, timestamp, onAskAI }) {
  const c = CONFIG[type] || CONFIG.warning;

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-4 flex gap-4`}>
      <span className="text-2xl shrink-0 mt-0.5">{c.icon}</span>

      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
            {type.toUpperCase()}
          </span>
          <span className="font-bold text-gray-800">{message}</span>
        </div>

        {/* Value + time */}
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">{sensor}:</span> {value}{unit} &nbsp;·&nbsp;
          <span className="text-gray-400 text-xs">
            {timestamp ? new Date(timestamp).toLocaleString('en-IN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            }) : '—'}
          </span>
        </p>

        {/* Recommended action */}
        {action && (
          <p className="text-xs text-gray-500 mt-1">
            💡 <span className="font-medium">Action:</span> {action}
          </p>
        )}
      </div>

      {/* Ask AI button */}
      {onAskAI && (
        <button
          onClick={onAskAI}
          className="shrink-0 self-center px-3 py-1.5 rounded-xl bg-agri-primary text-white text-xs font-semibold hover:bg-agri-medium transition-colors"
        >
          Ask AI
        </button>
      )}
    </div>
  );
}
