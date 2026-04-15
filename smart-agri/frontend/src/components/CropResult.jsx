// CropResult: displays formatted Gemini AI response in a clean card
// Used by AIAssistant page for all 6 AI sections

export default function CropResult({ title, icon, result, loading, loadingText }) {
  if (loading) {
    return (
      <div className="mt-4 p-5 rounded-2xl bg-agri-snow border border-agri-frost flex items-center gap-4">
        <div className="w-6 h-6 border-2 border-agri-primary border-t-transparent rounded-full animate-spin shrink-0" />
        <p className="text-agri-primary font-medium">
          {loadingText || 'AgriSense AI is thinking...'}
        </p>
      </div>
    );
  }

  if (!result) return null;

  // Simple Gemini markdown → readable text formatter
  const lines = result.split('\n').filter(l => l.trim());

  return (
    <div className="mt-4 rounded-2xl border border-agri-frost bg-white shadow-sm overflow-hidden">
      {title && (
        <div className="flex items-center gap-2 px-5 py-3 bg-agri-snow border-b border-agri-frost">
          <span className="text-xl">{icon}</span>
          <h4 className="font-bold text-agri-dark">{title}</h4>
        </div>
      )}
      <div className="p-5 space-y-2 text-sm text-gray-700 leading-relaxed">
        {lines.map((line, i) => {
          // Heading (##, ###)
          if (line.startsWith('### ')) return <h4 key={i} className="font-bold text-agri-primary mt-3">{line.replace(/^### /, '')}</h4>;
          if (line.startsWith('## '))  return <h3 key={i} className="font-bold text-agri-dark text-base mt-4">{line.replace(/^## /, '')}</h3>;
          if (line.startsWith('# '))   return <h2 key={i} className="font-extrabold text-agri-dark text-lg mt-4">{line.replace(/^# /, '')}</h2>;
          // Bullet point
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={i} className="flex gap-2">
                <span className="text-agri-medium mt-0.5 shrink-0">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^[-*] /, '')) }} />
              </div>
            );
          }
          // Numbered list
          if (/^\d+\. /.test(line)) {
            return (
              <div key={i} className="flex gap-2">
                <span className="text-agri-medium font-bold shrink-0">{line.match(/^\d+/)[0]}.</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\. /, '')) }} />
              </div>
            );
          }
          // Regular paragraph
          return <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
        })}
      </div>
    </div>
  );
}

// Convert **bold** and *italic* to HTML
function formatInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-agri-dark">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}
