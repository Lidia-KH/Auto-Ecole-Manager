import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AddExamenModal from "../components/exams/AddExamsModal";
import EditExamenModal from "../components/exams/EditExamModal";

import ini from "../components/payements/ini";


// ── style maps 
const TYPE_STYLE = {
  code:     "bg-amber-50  text-amber-700  border border-amber-100",
  créneau: "bg-purple-50  text-purple-700  border border-purple-100",
  conduite: "bg-blue-50   text-blue-700   border border-blue-100",
}

const RESULTAT_STYLE = {
  en_attente: "bg-gray-100    text-gray-500",
  reussi:     "bg-emerald-50  text-emerald-700",
  echoue:     "bg-red-50      text-red-700",
  absent:     "bg-amber-50    text-amber-700",
}

const RESULTAT_LABEL = {
  en_attente: "En attente",
  reussi:     "Réussi",
  echoue:     "Échoué",
  absent:     "Absent",
}

function fmtDate(str) {
  if (!str) return "—"
  const d = new Date(str)
  if (isNaN(d)) return str
  return d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
}

// stat card 
function StatCard({ label, value, color = "gray" }) {
  const STYLES = {
    gray:    "bg-gray-50    text-gray-700    border-gray-100",
    indigo:  "bg-indigo-50  text-indigo-700  border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber:   "bg-amber-50   text-amber-700   border-amber-100",
    red:     "bg-red-50     text-red-700     border-red-100",
  }
  return (
    <div className={`rounded-2xl border p-4 ${STYLES[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-2">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

// upcoming exams card 
function UpcomingCard({ exams }) {
  const today    = new Date().toLocaleDateString("sv-SE")
  const upcoming = exams
    .filter(e => e.resultat === "en_attente" && e.date_examen >= today)
    .sort((a, b) => a.date_examen.localeCompare(b.date_examen))
    .slice(0, 5)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <p className="text-sm font-semibold text-gray-700">Prochains examens</p>
        <p className="text-xs text-gray-400 mt-0.5">{upcoming.length} à venir</p>
      </div>
      <div className="divide-y divide-gray-50">
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-300 text-center py-8">Aucun examen à venir</p>
        ) : upcoming.map(e => (
          <div key={e.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center">
                {ini(e.nom, e.prenom)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{e.nom} {e.prenom}</p>
                <p className="text-xs text-gray-400">{fmtDate(e.date_examen)}{e.heure ? ` — ${e.heure}` : ""}{e.lieu ? ` · ${e.lieu}` : ""}</p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${TYPE_STYLE[e.type_examen] ?? TYPE_STYLE.code}`}>
              {e.type_examen}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// filters 
const FILTERS = [
  { key: "tous",       label: "Tous"       },
  { key: "en_attente", label: "En attente" },
  { key: "reussi",     label: "Réussis"    },
  { key: "echoue",     label: "Échoués"    },
  { key: "absent",     label: "Absents"    },
]

const TYPE_FILTERS = [
  { key: "tous",     label: "Tous les types" },
  { key: "code",     label: "Code"           },
  { key: "créneau", label: "Créneau"       },
  { key: "conduite", label: "Conduite"       },
]

// main page 
export default function Examens() {
  const navigate = useNavigate()
  const [exams, setExams]               = useState([])
  const [stats, setStats]               = useState(null)
  const [search, setSearch]             = useState("")
  const [filterResult, setFilterResult] = useState("tous")
  const [filterType, setFilterType]     = useState("tous")
  const [showModal, setShowModal]       = useState(false)
  const [editingExam, setEditingExam]   = useState(null)

  async function loadAll() {
    const [data, s] = await Promise.all([
      window.api.getAllExams(),
      window.api.getExamsStats(),
    ])
    setExams(data)
    setStats(s)
  }

  useEffect(() => { loadAll() }, [])

  // ── derived stats 
  const today      = new Date().toLocaleDateString("sv-SE")
  const thisWeekStart = (() => {
    const d = new Date(); const day = d.getDay()
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    return d.toLocaleDateString("sv-SE")
  })()
  const thisMonthStart = today.slice(0, 7) + "-01"

  const totalUpcoming   = exams.filter(e => e.resultat === "en_attente" && e.date_examen >= today).length
  const totalThisWeek   = exams.filter(e => e.date_examen >= thisWeekStart).length
  const totalThisMonth  = exams.filter(e => e.date_examen >= thisMonthStart).length
  const totalReussis    = exams.filter(e => e.resultat === "reussi").length
  const totalEchoues    = exams.filter(e => e.resultat === "echoue").length
  const tauxReussite    = exams.filter(e => e.resultat !== "en_attente").length > 0
    ? Math.round((totalReussis / exams.filter(e => e.resultat !== "en_attente").length) * 100)
    : 0

  // ── filtering 
  const visible = exams.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      e.nom?.toLowerCase().includes(q) ||
      e.prenom?.toLowerCase().includes(q) ||
      e.numero?.toLowerCase().includes(q) ||
      e.lieu?.toLowerCase().includes(q)
    const matchResult = filterResult === "tous" || e.resultat === filterResult
    const matchType   = filterType === "tous"   || e.type_examen === filterType
    return matchSearch && matchResult && matchType
  })

  async function handleDelete(id) {
      if (!window.confirm("Supprimer cet examen ?")) 
          return;
      await window.api.deleteExam(id);
      loadAll();
      
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Examens</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {exams.length} examen{exams.length !== 1 ? "s" : ""} enregistré{exams.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Inscrire à un examen
          </button>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-6 gap-4">
          <StatCard label="Total"       value={exams.length}    color="gray"    />
          <StatCard label="À venir"     value={totalUpcoming}   color="indigo"  />
          <StatCard label="Cette semaine" value={totalThisWeek} color="indigo"  />
          <StatCard label="Ce mois"     value={totalThisMonth}  color="indigo"  />
          <StatCard label="Réussis"     value={totalReussis}    color="emerald" />
          <StatCard label="Taux réussite" value={`${tauxReussite}%`} color="emerald" />
        </div>

        {/* upcoming card */}
        {/* <UpcomingCard exams={exams} /> */}

        {/* search + filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* search */}
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
              placeholder="Nom, numéro, lieu…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* result filter chips */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => {
              const count = f.key === "tous" ? exams.length : exams.filter(e => e.resultat === f.key).length
              return (
                <button key={f.key} onClick={() => setFilterResult(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    filterResult === f.key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                  }`}>
                  {f.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${filterResult === f.key ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* type filter */}
          <div className="flex gap-2">
            {TYPE_FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilterType(f.key)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filterType === f.key
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Aucun examen trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Date", "Heure", "Élève", "Type", "Lieu", "Résultat", "Note", ""].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(e => (
                  <tr key={e.id}
                    onClick={() => navigate(`/eleves/${e.student_id}`)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group">

                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {fmtDate(e.date_examen)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {e.heure || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {ini(e.nom, e.prenom)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{e.nom} {e.prenom}</p>
                          <p className="text-xs text-gray-400 font-mono">{e.numero}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${TYPE_STYLE[e.type_examen] ?? TYPE_STYLE.code}`}>
                        {e.type_examen}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {e.lieu || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${RESULTAT_STYLE[e.resultat] ?? RESULTAT_STYLE.en_attente}`}>
                        {RESULTAT_LABEL[e.resultat] ?? e.resultat}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400 max-w-xs truncate">
                      {e.note || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                            onClick={ev => {ev.stopPropagation(); handleDelete(e.id);}}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                            title="Supprimer">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>

                        </button>
                        <button
                          onClick={ev => { ev.stopPropagation(); setEditingExam(e) }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <svg className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

          {visible.length > 0 && (
            <div className="text-xs text-gray-400 text-right">
              <span className="text-xs text-gray-400">
                {visible.length} examen{visible.length !== 1 ? "s" : ""} affiché{visible.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

      </div>

      
      {showModal && (
        <AddExamenModal
          student={null}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadAll() }}
        />
      )}

      {editingExam && (
        <EditExamenModal
          examen={editingExam}
          onClose={() => setEditingExam(null)}
          onSaved={() => { setEditingExam(null); loadAll() }}
          onDeleted={() => { setEditingExam(null); loadAll() }}
        />
      )}
    </div>
  )
}