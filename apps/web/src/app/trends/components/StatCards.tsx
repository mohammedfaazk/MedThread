interface Props { data: any[] }

export default function StatCards({ data }: Props) {
  const totalCases     = data.reduce((s, r) => s + r.caseCount, 0);
  const uniqueSymptoms = new Set(data.map(r => r.symptomTag)).size;
  const statesAffected = new Set(data.map(r => r.regionName)).size;
  const criticalRegions = new Set(
    data.filter(r => r.alertLevel !== 'none').map(r => r.regionName)
  ).size;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {[
        { label: 'Total reports',    value: totalCases.toLocaleString(),     danger: false },
        { label: 'Symptoms tracked', value: uniqueSymptoms,                  danger: false },
        { label: 'States affected',  value: statesAffected,                  danger: false },
        { label: 'Critical regions', value: criticalRegions,                 danger: true  },
      ].map(c => (
        <div key={c.label} className="bg-gray-50 rounded-xl p-3">
          <div className={`text-xl font-medium ${c.danger ? 'text-red-600' : 'text-gray-900'}`}>
            {c.value}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
        </div>
      ))}
    </div>
  );
}