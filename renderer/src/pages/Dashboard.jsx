import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import ini from "../components/payements/ini"
import fmt from "../components/payements/fmt"

function fmtDate(str) {
  if (!str) return "—"
  const d = new Date(str)
  if (isNaN(d)) return str
  return d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" })
}

const TODAY       = new Date().toLocaleDateString("sv-SE")
const MONTH_START = TODAY.slice(0, 7) + "-01"
const WEEK_START  = (() => { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); return d.toLocaleDateString("sv-SE") })()
const WEEK_END    = (() => { const d = new Date(WEEK_START); d.setDate(d.getDate() + 6); return d.toLocaleDateString("sv-SE") })()
const MONTH_FR    = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

const TYPE_CLS = { conduite:"bg-blue-50 text-blue-700", code:"bg-amber-50 text-amber-700", créneau:"bg-purple-50 text-purple-700" }

function KpiCard({ label, value, sub, color="white", onClick, trend }) {
  const bg = { white:"bg-white border-gray-100", blue:"bg-blue-600 border-blue-600", emerald:"bg-emerald-600 border-emerald-600", red:"bg-red-50 border-red-100", indigo:"bg-indigo-50 border-indigo-100" }
  const isDark = color === "blue" || color === "emerald"
  return (
    <div onClick={onClick} className={`rounded-2xl border p-5 ${bg[color]} ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}>
      <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${isDark ? "text-white/70" : "text-gray-400"}`}>{label}</p>
      <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
      {sub   && <p className={`text-xs mt-1 ${isDark ? "text-white/60" : "text-gray-400"}`}>{sub}</p>}
      {trend !== undefined && <p className={`text-xs mt-2 font-semibold ${trend >= 0 ? (isDark ? "text-emerald-300" : "text-emerald-600") : "text-red-400"}`}>{trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs mois dernier</p>}
    </div>
  )
}

function SectionHeader({ title, badge, badgeColor="blue", action, onAction }) {
  const badgeCls = { blue:"bg-blue-50 text-blue-600", indigo:"bg-indigo-50 text-indigo-600", red:"bg-red-50 text-red-600" }
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {badge !== undefined && <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${badgeCls[badgeColor]}`}>{badge}</span>}
      </div>
      {onAction && <button onClick={onAction} className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">{action}</button>}
    </div>
  )
}

function Empty({ text }) { return <p className="text-sm text-gray-300 text-center py-10">{text}</p> }

function RevenueChart({ data }) {
  if (!data?.length) return <Empty text="Aucune donnée" />
  const max = Math.max(...data.map(d => d.total), 1)
  return (
    <div className="space-y-3">
      {data.map(d => {
        const [, month] = d.month.split("-")
        const pct = Math.round((d.total / max) * 100)
        return (
          <div key={d.month} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-8 flex-shrink-0 font-medium">{MONTH_FR[parseInt(month)-1]}</span>
            <div className="flex-1 h-7 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-xl transition-all duration-700" style={{ width:`${pct}%` }} />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600">{fmt(d.total)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [todaySessions,  setTodaySessions]  = useState([])
  const [upcomingExams,  setUpcomingExams]  = useState([])
  const [unpaidStudents, setUnpaidStudents] = useState([])
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [kpi,            setKpi]            = useState(null)
  const [loading,        setLoading]        = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [sessions, exams, balances, monthly] = await Promise.all([
          window.api.getAllSessions(),
          window.api.getAllExams(),
          window.api.getPayementsAllBalances(),
          window.api.getPayementsMonthlyRevenue(),
        ])
        setTodaySessions(sessions.filter(s => s.date_seance === TODAY).sort((a,b) => (a.heure??"").localeCompare(b.heure??"")))
        setUpcomingExams(exams.filter(e => e.resultat==="en_attente" && e.date_examen>=TODAY && e.date_examen<=WEEK_END).sort((a,b) => a.date_examen.localeCompare(b.date_examen)))
        const unpaid = balances.filter(b => (b.reste??0)>0).sort((a,b) => b.reste-a.reste)
        setUnpaidStudents(unpaid)
        setMonthlyRevenue(monthly ?? [])
        const thisM = (monthly??[]).slice(-1)[0]?.total ?? 0
        const lastM = (monthly??[]).slice(-2)[0]?.total ?? 0
        const trend = lastM > 0 ? Math.round(((thisM-lastM)/lastM)*100) : 0
        const done  = exams.filter(e => e.resultat !== "en_attente")
        setKpi({
          totalStudents:  balances.length,
          sessionsToday:  sessions.filter(s => s.date_seance===TODAY).length,
          sessionsMonth:  sessions.filter(s => s.date_seance>=MONTH_START).length,
          examsWeek:      exams.filter(e => e.date_examen>=WEEK_START && e.date_examen<=WEEK_END).length,
          revenueMonth:   thisM,
          revenueTrend:   trend,
          unpaidCount:    unpaid.length,
          unpaidTotal:    unpaid.reduce((s,b) => s+(b.reste??0), 0),
          passRate:       done.length ? Math.round(done.filter(e=>e.resultat==="reussi").length/done.length*100) : 0,
        })
      } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <span className="text-sm">Chargement…</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tableau de bord</h1>
            <p className="text-sm text-gray-400 mt-0.5 capitalize">
              {new Date().toLocaleDateString("fr-DZ", { weekday:"long", day:"numeric", month:"long" })}
            </p>
          </div>
          <div className="flex gap-2">
            {kpi?.sessionsToday > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl border border-blue-100">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"/>
                {kpi.sessionsToday} séance{kpi.sessionsToday>1?"s":""} aujourd'hui
              </span>
            )}
            {kpi?.examsWeek > 0 && (
              <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-100">
                {kpi.examsWeek} examen{kpi.examsWeek>1?"s":""} cette semaine
              </span>
            )}
          </div>
        </div>

        {/* KPI row 1 */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Élèves inscrits"   value={kpi?.totalStudents??0}  sub="total enregistrés"      color="white"   onClick={() => navigate("/eleves")} />
          <KpiCard label="Revenu ce mois"    value={fmt(kpi?.revenueMonth)} trend={kpi?.revenueTrend}    color="emerald" onClick={() => navigate("/paiements")} />
          <KpiCard label="Total impayé"      value={fmt(kpi?.unpaidTotal)}  sub={`${kpi?.unpaidCount??0} élèves`} color={kpi?.unpaidCount>0?"red":"white"} onClick={() => navigate("/paiements")} />
          <KpiCard label="Taux de réussite"  value={`${kpi?.passRate??0}%`} sub="examens terminés"       color="indigo" />
        </div>

        {/* KPI row 2 */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Séances ce mois"       value={kpi?.sessionsMonth??0}  color="white" onClick={() => navigate("/seances")} />
          <KpiCard label="Séances aujourd'hui"   value={kpi?.sessionsToday??0}  color={kpi?.sessionsToday>0?"blue":"white"} />
          <KpiCard label="Examens cette semaine" value={kpi?.examsWeek??0}      color="white" onClick={() => navigate("/examens")} />
          <KpiCard label="Examens à venir"       value={upcomingExams.length}   sub="jusqu'à fin semaine" color="white" onClick={() => navigate("/examens")} />
        </div>

        {/* revenue chart + today sessions */}
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">Revenu mensuel</h2>
                <p className="text-xs text-gray-400 mt-0.5">6 derniers mois</p>
              </div>
              <button onClick={() => navigate("/paiements")} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Voir détails →</button>
            </div>
            <RevenueChart data={monthlyRevenue.slice(-6)} />
          </div>

          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <SectionHeader title="Séances aujourd'hui" badge={todaySessions.length} badgeColor="blue" action="Toutes →" onAction={() => navigate("/seances")} />
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {todaySessions.length === 0 ? <Empty text="Aucune séance aujourd'hui" /> :
                todaySessions.map(s => (
                  <div key={s.id} onClick={() => navigate(`/eleves/${s.student_id}`)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                    <p className="text-xs font-semibold text-gray-400 w-10 flex-shrink-0">{s.heure||"—"}</p>
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{ini(s.nom,s.prenom)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.nom} {s.prenom}</p>
                      <p className="text-xs text-gray-400">{s.moniteur||"—"}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 ${TYPE_CLS[s.type_seance]??TYPE_CLS.conduite}`}>{s.type_seance}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* upcoming exams + unpaid */}
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <SectionHeader title="Examens cette semaine" badge={upcomingExams.length} badgeColor="indigo" action="Tous les examens →" onAction={() => navigate("/examens")} />
            {upcomingExams.length === 0 ? <Empty text="Aucun examen cette semaine" /> : (
              <table className="w-full">
                <thead><tr className="border-b border-gray-50">
                  {["Date","Élève","Type","Lieu"].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {upcomingExams.map(e => (
                    <tr key={e.id} onClick={() => navigate(`/eleves/${e.student_id}`)}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{fmtDate(e.date_examen)}{e.heure?` ${e.heure}`:""}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{ini(e.nom,e.prenom)}</div>
                          <span className="text-sm font-medium text-gray-800">{e.nom} {e.prenom}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${TYPE_CLS[e.type_examen]??TYPE_CLS.code}`}>{e.type_examen}</span></td>
                      <td className="px-5 py-3 text-sm text-gray-500">{e.lieu||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <SectionHeader title="Impayés" badge={kpi?.unpaidCount||undefined} badgeColor="red" action="Voir tout →" onAction={() => navigate("/paiements")} />
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {unpaidStudents.length === 0 ? <Empty text="Aucun impayé" /> :
                unpaidStudents.slice(0,8).map(s => (
                  <div key={s.id} onClick={() => navigate(`/eleves/${s.id}`)}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-7 h-7 rounded-full bg-red-50 text-red-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{ini(s.nom,s.prenom)}</div>
                    <p className="text-sm text-gray-700 font-medium flex-1 truncate">{s.nom} {s.prenom}</p>
                    <p className="text-xs font-bold text-red-600 flex-shrink-0">{fmt(s.reste)}</p>
                  </div>
                ))
              }
            </div>
            {kpi?.unpaidTotal > 0 && (
              <div className="px-5 py-3 border-t border-gray-50 bg-red-50/50">
                <p className="text-xs font-bold text-red-600">Total: {fmt(kpi.unpaidTotal)}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}