function fmtDate(str) {
  if (!str) return "—"
  const d = new Date(str)
  if (isNaN(d)) return str
  return d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
}

const TYPE_CLS = {
  code:     "bg-amber-50  text-amber-700",
  créneau:  "bg-purple-50 text-purple-700",
  conduite: "bg-blue-50   text-blue-700",
}

export default function SessionHistoryCard({ sessions = [], onAdd, onEdit }) {
  const visible = sessions.slice(0, 5)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-50">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Séances
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Dernières séances enregistrées
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      <div className="px-6 py-4">
        {visible.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-gray-300">Aucune séance enregistrée</p>
            <button onClick={onAdd} className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium">
              Ajouter une séance →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map(s => (
              <div
                key={s.id}
                onClick={() => onEdit?.(s)}
                className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${TYPE_CLS[s.type] ?? TYPE_CLS.conduite}`}>
                    {s.type}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-gray-700">
                      {fmtDate(s.date_seance)}{s.heure ? ` — ${s.heure}` : ""}
                    </p>
                    {(s.moniteur || s.voiture) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[s.moniteur, s.voiture].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.note && (
                    <span className="text-xs text-gray-400 italic max-w-32 truncate">{s.note}</span>
                  )}
                  <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            ))}
            {sessions.length > 5 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                +{sessions.length - 5} autre{sessions.length - 5 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}