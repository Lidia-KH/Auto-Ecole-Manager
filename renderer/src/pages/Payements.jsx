import { useState, useEffect } from "react";
import AddPayementModal from "../components/payements/AddPayementModal";
import Stat from "../components/payements/Stat";
import BalanceRow from "../components/payements/BalanceRow";
import StudentPayementDetail from "../components/payements/StudentPayementDetail";
import fmt from "../components/payements/fmt";
import ini from "../components/payements/ini";



const MOTIFS = [
    { value: "acompte", label: "Acompte inscription" },
    { value: "seance", label: "Séance conduite" },
    { value: "solde", label: "Sold total" },
    { value: "examen", label: "Frais examen" },
    { value: "autre", label: "Autre" },
]


// Paiement page

export default function Payements(){
    const [tab, setTab] = useState("finances")
    const [stats, setStats] = useState(null)
    const [balances, setBalances] = useState([])
    const [monthly, setMonthly] = useState([])
    const [search, setSearch] = useState("")
    const [filterStatus, setFilter] = useState("tous")
    const [payingFor, setPayingFor] = useState(null)
    const [detailId, setDetailId] = useState(null)

    async function loadAll() {
        const [s, b, m] = await Promise.all([
            window.api.getPayementsDashboardStats(),
            window.api.getPayementsAllBalances(),
            window.api.getPayementsMonthlyRevenue(),
        ])
        setStats(s)
        setBalances(b)
        setMonthly(m)
    }

    useEffect(() => {loadAll()}, [])

    const MONTH_FR = {
        "01":"Jan",
        "02":"Fév",
        "03":"Mar",
        "04":"Avr",
        "05":"Mai",
        "06":"Jun",
        "07":"Jul",
        "08":"Aou",
        "09":"Sep",
        "10":"Oct",
        "11":"Nov",
        "12":"Déc",
    }

    const maxRevenue = Math.max(...monthly.map(m => m.total), 1)

    const visibleBalances = balances.filter(s => {
        const q = search.toLowerCase()
        const matchSearch = !q || s.nom.toLowerCase().includes(q) || s.prenom.toLowerCase().includes(q) || s.numero?.toLowerCase().includes(q)
        const matchFilter = 
        filterStatus === "tous" ||
        (filterStatus === "soldé" && s.reste <= 0) ||
        (filterStatus === "impayé" && s.total_paye === 0) ||
        (filterStatus === "partiel" && s.total_paye > 0 && s.reste > 0)
        return matchSearch && matchFilter

    })

    const FILTERS = [
        {key: "tous", label:"Tous", count:balances.length},
        {key: "impayé", label:"Impayés", count:balances.filter(s => s.total_paye === 0).length},
        {key: "partiel", label:"Partiels", count:balances.filter(s => s.total_paye > 0 && s.reste > 0).length},
        {key: "soldé", label:"Soldés", count:balances.filter(s => s.reste <= 0).length},
    ]

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-8">
            {payingFor && (
                <AddPayementModal
                student={payingFor}
                onClose={() => setPayingFor(null)}
                onSaved={() => {setPayingFor(null); loadAll() }} 
                />
            )}
            {detailId && (
                <StudentPayementDetail
                studentId={detailId}
                onClose={() => setDetailId(null)}
                onPlay={s => {setDetailId(null); setPayingFor(s)}} 
                />
            )}
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Paiements
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Finances de l'auto-école
                        </p>
                    </div>
                    <button 
                    onClick={() => setPayingFor({id:null, nom:"—", prenom:""})}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-blue-200">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter un paiement
                    </button>
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-xl w-fit">
                    {[["finances", "Vue financière"], ["élèves", "Par élève"]].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}>
                            {label}
                        </button>
                    ))}

                </div>

                {tab === "finances" && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-4 gap-4">
                            <Stat label="Aujourd'hui" value={fmt(stats?.today)} color="green" />
                            <Stat label="Ce mois" value={fmt(stats?.thisMonth)} color="green"/>
                            <Stat label="Total impayé" value={fmt(stats?.totalUnpaid)} color="red"/>
                            <Stat label="Elèves débiteurs" value={stats?.unpaidCount ?? 0} color="amber"/>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-50">
                                    <p className="text-sm font-semibold text-gray-700">
                                        Revenue mensuel
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        6 derniers mois
                                    </p>
                                </div>
                                <div className="p-4 space-y-2">
                                    {monthly.map(m => {
                                        const [year, month] = m.month.split("-")
                                        const pct = Math.round((m.total / maxRevenue) * 100)
                                        return (
                                            <div key={m.month} className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500 w-8">
                                                    {MONTH_FR[month]}
                                                </span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{width:`${pct}%`}} />
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 w-28 text-right">
                                                    {fmt(m.total)}
                                                </span>
                                            </div>
                                        )
                                    })}

                                    {monthly.length === 0 && (
                                        <p className="text-sm text-gray-300 text-center py-6">
                                            Aucune donnée
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-50">
                                    <p className="text-sm font-semibold text-gray-700">
                                        Elèves débiteurs
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Montants restants les plus élevés
                                    </p>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {(stats?.debtors ?? []).slice(0, 6).map(d => (
                                        <div key={d.id}
                                        onClick={() => setDetailId(d.id)}
                                        className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-red-50 text-red-600 text-xs font-semibold flex items-center justify-center">
                                                    {ini(d.nom, d.prenom)}
                                                </div>
                                                <span className="text-sm text-gray-700">
                                                    {d.nom} {d.prenom}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-red-600">
                                                {fmt(d.reste)}
                                            </span>
                                        </div>
                                    ))}
                                    {(stats?.debtors ?? []).length === 0 && (
                                        <p className="text-sm text-gray-300 text-center py-8">
                                            Aucun impayé
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "élèves" && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-sm">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                placeholder="Rechercher par numéro, nom..."
                                value={search}
                                onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="flex gap-2">
                                {FILTERS.map(f => (
                                    <button key={f.key} onClick={() => setFilter(f.key)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                        filterStatus === f.key
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                                    }`}>
                                        {f.label}
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${filterStatus === f.key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                                            {f.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        {["Elèves", "Formule", "Prix total", "Payé", "Reste", "Statut", ""].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-left font-semibold text-gray-400 uppercase tracking-widest">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleBalances.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-16 text-gray-300 text-sm">
                                                Aucun résultat
                                            </td>
                                        </tr>
                                    ) : (
                                        visibleBalances.map(s => (
                                            <BalanceRow 
                                            key={s.id}
                                            s={s}
                                            onPlay={setPayingFor}
                                            onClick={() => setDetailId(s.id)}/>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}