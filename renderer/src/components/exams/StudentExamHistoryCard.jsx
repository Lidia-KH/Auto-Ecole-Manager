import fmt from "../payements/fmt"

const RESULTAT = {
  en_attente: { label: "En attente", cls: "bg-gray-100 text-gray-500"          },
  reussi:     { label: "Réussi",     cls: "bg-emerald-50 text-emerald-700"      },
  echoue:     { label: "Échoué",     cls: "bg-red-50 text-red-600"             },
  absent:     { label: "Absent",     cls: "bg-amber-50 text-amber-700"         },
}

const TYPE_CLS = {
  code:     "bg-amber-50 text-amber-700",
  créneau: "bg-purple-50 text-purple-700",
  conduite: "bg-blue-50 text-blue-700",
}


export default function StudentExamHistoryCard({ exams = [], onAdd, onEdit }) {
  const visible = exams.slice(0, 5)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-50">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Examens</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Inscrire
        </button>
      </div>

      <div className="px-6 py-4">
        {visible.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-gray-300">Aucun examen enregistré</p>
            <button onClick={onAdd} className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-medium">
              Inscrire à un examen →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map(e => {
              const r = RESULTAT[e.resultat] ?? RESULTAT.en_attente
              return (
                <div
                  key={e.id}
                  onClick={() => onEdit?.(e)}
                  className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${TYPE_CLS[e.type_examen] ?? TYPE_CLS.code}`}>
                      {e.type_examen}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        {fmt(e.date_examen)}{e.heure ? ` — ${e.heure}` : ""}
                      </p>
                      {e.lieu && <p className="text-xs text-gray-400 mt-0.5">{e.lieu}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.cls}`}>
                      {r.label}
                    </span>
                    <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
              )
            })}
            {exams.length > 5 && (
              <p className="text-xs text-gray-400 text-center pt-1">+{exams.length - 5} autre{exams.length - 5 > 1 ? "s" : ""}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}