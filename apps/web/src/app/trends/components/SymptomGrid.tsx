'use client';

const SYM_STYLES: Record<string, { bg: string; dot: string; text: string }> = {
  'Fever':               { bg:'#fecaca', dot:'#dc2626', text:'#991b1b' },
  'Headache':            { bg:'#fed7aa', dot:'#ea580c', text:'#9a3412' },
  'Cough':               { bg:'#fef08a', dot:'#ca8a04', text:'#854d0e' },
  'Nausea':              { bg:'#fbcfe8', dot:'#db2777', text:'#9d174d' },
  'Fatigue':             { bg:'#ddd6fe', dot:'#7c3aed', text:'#5b21b6' },
  'Rash':                { bg:'#a5f3fc', dot:'#0891b2', text:'#155e75' },
  'Vomiting':            { bg:'#bbf7d0', dot:'#16a34a', text:'#14532d' },
  'Dizziness':           { bg:'#e9d5ff', dot:'#9333ea', text:'#6b21a8' },
  'Chest Pain':          { bg:'#fca5a5', dot:'#b91c1c', text:'#7f1d1d' },
  'Sore Throat':         { bg:'#bfdbfe', dot:'#2563eb', text:'#1e3a8a' },
  'Shortness of Breath': { bg:'#fde68a', dot:'#d97706', text:'#78350f' },
  'Body Ache':           { bg:'#ccfbf1', dot:'#0d9488', text:'#134e4a' },
  'Diarrhea':            { bg:'#d1fae5', dot:'#059669', text:'#064e3b' },
  'Loss of Appetite':    { bg:'#ffe4e6', dot:'#e11d48', text:'#881337' },
  'Runny Nose':          { bg:'#e0f2fe', dot:'#0284c7', text:'#0c4a6e' },
};

interface Props {
  data:       any[];
  activeSym:  string;
  onSymClick: (s: string) => void;
}

export default function SymptomGrid({ data, activeSym, onSymClick }: Props) {
  const symMap: Record<string, number> = {};
  data.forEach(r => { symMap[r.symptomTag] = (symMap[r.symptomTag] || 0) + r.caseCount; });
  const entries = Object.entries(symMap).sort((a, b) => b[1] - a[1]);
  const maxCount = entries[0]?.[1] || 1;

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-gray-500 mb-2">
        Symptom breakdown — click any card to filter map
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {entries.map(([sym, count]) => {
          const style    = SYM_STYLES[sym] || { bg:'#f3f4f6', dot:'#6b7280', text:'#374151' };
          const pct      = Math.round((count / maxCount) * 100);
          const isActive = activeSym === sym;
          return (
            <div
              key={sym}
              onClick={() => onSymClick(sym)}
              className="rounded-xl p-2.5 cursor-pointer transition-all"
              style={{
                background: style.bg,
                border:     `1.5px solid ${isActive ? style.dot : 'transparent'}`,
                opacity:    activeSym && !isActive ? 0.35 : 1,
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-medium leading-tight" style={{ color: style.text }}>
                  {sym}
                </span>
                <span className="w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0"
                  style={{ background: style.dot }} />
              </div>
              <div className="text-lg font-medium mt-1" style={{ color: style.text }}>
                {count.toLocaleString()}
              </div>
              <div className="text-[10px] mb-1.5" style={{ color: style.text, opacity: 0.65 }}>
                cases
              </div>
              <div className="h-1 rounded-full" style={{ background: `${style.dot}22` }}>
                <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: style.dot }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}