import { useEffect, useState } from "react"
import AddExamenModal from "../examens/AddExamenModal"
import EditExamenModal from "../examens/EditExamenModal"

function fmtDate(str) {
  if (!str) return "—"
  const d = new Date(str)
  if (isNaN(d)) return str
  return d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
}

const RESULTAT_STYLE = {
  en_attente: { cls: "bg-gray-100 text-gray-500",        label: "En attente" },
  reussi:     { cls: "bg-emerald-50 text-emerald-700",   label: "Réussi"     },
  echoue:     { cls: "bg-red-50 text-red-600",           label: "Échoué"     },
  absent:     { cls: "bg-amber-50 text-amber-700",       label: "Absent"     },
}

const TYPE_STYLE = {
  code:     "bg-amber-50 text-amber-700",
  créneau: "bg-purple-50 text-purple-700",
  conduite: "bg-blue-50 text-blue-700",
}


export default function ExamenCard({ student, refreshKey }) {
  const [examens, setExamens]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [showAdd, setShowAdd]       = useState(false)
  const [editing, setEditing]       = useState(null)

  async function load() {
    setLoading(true)
    const data = await window.api.getExamsByStudent(student.id)
    setExamens(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [student.id, refreshKey])

  const upcoming = examens.filter(e => e.resultat === "en_attente")
  const passed   = examens.filter(e => e.resultat === "reussi")
  const failed   = examens.filter(e => e.resultat === "echoue")

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-50">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Examens</h2>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all active:scale-95">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Examen
          </button>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <p className="text-xs text-gray-300 text-center py-4">Chargement…</p>
          ) : (
            <>
              {/* mini stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  ["À venir",  upcoming.length, "text-indigo-600"],
                  ["Réussis",  passed.length,   "text-emerald-700"],
                  ["Échoués",  failed.length,   "text-red-600"],
                ].map(([label, val, cls]) => (
                  <div key={label} className="text-center bg-gray-50 rounded-xl py-2.5">
                    <p className={`text-lg font-bold ${cls}`}>{val}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* exam list */}
              {examens.length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-4">Aucun examen enregistré</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Historique</p>
                  {examens.map(e => {
                    const r = RESULTAT_STYLE[e.resultat] ?? RESULTAT_STYLE.en_attente
                    return (
                      <div key={e.id}
                        onClick={() => setEditing(e)}
                        className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${TYPE_STYLE[e.type_examen] ?? TYPE_STYLE.code}`}>
                            {e.type_examen}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-gray-700">{fmtDate(e.date_examen)}{e.heure ? ` — ${e.heure}` : ""}</p>
                            {e.lieu && <p className="text-xs text-gray-400 mt-0.5">{e.lieu}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.cls}`}>{r.label}</span>
                          <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAdd && (
        <AddExamenModal
          student={student}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); load() }}
        />
      )}

      {editing && (
        <EditExamenModal
          examen={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
          onDeleted={() => { setEditing(null); load() }}
        />
      )}
    </>
  )
}