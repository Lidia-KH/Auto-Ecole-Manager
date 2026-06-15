export default function ExamStatsCard({ exams = [] }) {
  const total   = exams.length
  const reussis = exams.filter(e => e.resultat === "reussi").length
  const echoues = exams.filter(e => e.resultat === "echoue").length
  const attente = exams.filter(e => e.resultat === "en_attente").length

  const CARDS = [
    { label: "Total",      value: total,   color: "gray"    },
    { label: "Réussis",    value: reussis, color: "emerald" },
    { label: "Échoués",    value: echoues, color: "red"     },
    { label: "En attente", value: attente, color: "indigo"  },
  ]

  const STYLES = {
    gray:    "bg-gray-50   text-gray-700   border-gray-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red:     "bg-red-50    text-red-700    border-red-100",
    indigo:  "bg-indigo-50 text-indigo-700 border-indigo-100",
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {CARDS.map(c => (
        <div key={c.label} className={`rounded-2xl border p-4 ${STYLES[c.color]}`}>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-2">{c.label}</p>
          <p className="text-2xl font-bold">{c.value}</p>
        </div>
      ))}
    </div>
  )
}