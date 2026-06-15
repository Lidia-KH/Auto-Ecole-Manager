export default function SessionStatsCard({ sessions = [], label, value, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-50   text-blue-700   border-blue-100",
    amber:  "bg-amber-50  text-amber-700  border-amber-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    gray:   "bg-gray-50   text-gray-700   border-gray-100",
  }

  // if used as a wrapper (sessions array passed), render all 3 cards
  if (sessions.length !== undefined && label === undefined) {
    const CARDS = [
      { label: "Total",    value: sessions.length,                                          color: "gray"  },
      { label: "Conduite", value: sessions.filter(s => s.type_seance === "conduite").length, color: "blue"  },
      { label: "Créneau", value: sessions.filter(s => s.type_seance === "créneau").length, color: "purple"  },
      { label: "Code",     value: sessions.filter(s => s.type_seance === "code").length,     color: "amber" },
    ]
    return (
      <div className="grid grid-cols-4 gap-3">
        {CARDS.map(c => (
          <div key={c.label} className={`rounded-2xl border p-4 ${colors[c.color]}`}>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-2">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    )
  }
    // if used as a single card (Sessions page), render one card
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-2">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}