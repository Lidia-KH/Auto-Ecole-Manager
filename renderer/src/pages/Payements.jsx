
import { useState, useEffect } from "react";

function fmt(n) {
    return Number(n ?? 0).toLocaleString("fr-DZ") + " DZD"
}

function ini(nom, prenom) {
    return ((nom?.[0] ?? "") + (prenom?.[0] ?? "")).toUpperCase()
}

const MOTIFS = [
    { value: "acompte", label: "Acompte inscription" },
    { value: "seance", label: "Séance cinduite" },
    { value: "solde", label: "Sold total" },
    { value: "examen", label: "Frais examen" },
    { value: "autre", label: "Autre" },
]

function Stat({ label, value, color = "default" }) {
    const colors = {
        default: "text-gray-900",
        green: "text-emerald-700",
        red: "text-red-600",
        amber: "text-amber-700"
    }

    return (
        <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase trackong-widest mb-1.5">
                {label}
            </p>
            <p className={`text-xl font-semibold ${colors[color]}`}>
                {value}
            </p>
        </div>
    )
}

function AddPayementModal({ student, onClose, onSaved }) {
    const [form, setForm] = useState({
        montant: "",
        motif: "acompte",
        date_payement: new Date().toLocaleDateString("sv-SE"),
        note: ""
    })
    const [loading, setLoading] = useState(false)
    const set = (k, v) => 
        setForm(f => 
            ({...f, 
                [k]: v})
        )

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.montant || isNaN(form.montant)) return
        setLoading(true)
        await window.api.addPayement({
            student_id: student.id,
            montant: parseInt(form.montant),
            motif: form.motif,
            date_payement: form.date_payement,
            note: form.note
        })
        setLoading(false)
        onSaved()
        
    }

    const inputCls = "w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">
                            Ajouter un paiement
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {student.nom} {student.prenom}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                            Montant (DZD) 
                        *</label>
                        <input className={inputCls} type="number" placeholder="5000" required
                        value={form.montant} onChange={e => set("montant", e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                            Motif
                        </label>
                        <select className={inputCls} value={form.motif} onChange={e => set("motif", e.target.value)}>
                            {MOTIFS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase trackong-widest mb-1.5">
                            Date
                        </label>
                        <input className={inputCls} type="date" value={form.date_payement} onChange={e => set("date_payement", e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                            Note (optionnel)
                        </label>
                        <input className={inputCls} placeholder="Remarque..." value={form.note} onChange={e => set("note", e.target.value)} />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                        className="flex-1 py-2 text-sm tex-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading}
                        className="flex-1 py-2 text-sm font-semibold bg-blue-600 hove:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-60">
                            {loading ? "Enregistrement..." : "Enregistrer"} 
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function BalanceRow({ s, onPlay, onClick }) {
    const pct = s.prix > 0 ? Math.round((s.total_paye / s.prix) * 100) : 0
    const status = s.reste <= 0 ? "soldé" : s.total_paye === 0 ? "impayé" : "partiel"
    const statusStyle = {
        soldé: "bg-emerald-50 text-emerald-700",
        impayé: "bg-red-50 text-red-700",
        partiel: "bg-amber-50 text-amber-700",
    }

    return (
        <tr onClick={onClick} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group">
            <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {ini(s.nom, s.prenom)}

                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-mono">
                            {s.numero}
                        </p>
                    </div>
                </div>

            </td>
            <td className="px-5 py-3">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200">
                    {s.formation_nom ?? "—"}
                </span>
            </td>
            <td className="px-5 py-3 text-sm text-gray-600">
                {fmt(s.prix)}
            </td>
            <td className="px-5 py-3 text-sm font-medium text-emerald-700">
                {fmt(s.total_paye)}
            </td>
            <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-12">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{width: `${pct}`}} />
                    </div>
                    <span className={`text-xs font-semibold ${s.reste > 0 ? "text-red-600" : "text-emerald-700"}`}>
                        {s.reste > 0 ? fmt(s.reste) : "Soldé"}
                    </span>
                </div>
            </td>
            <td className="px-5 py-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[status]}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}

                </span>
            </td>
            <td className="px-5 py-3">
                <button
                onClick={e => {e.stopPropagation(); onPlay(e)}} 
                className="opacity-0 group-hover:opacity-100 transition-opacity px-3 pu-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg">
                    + Paiement

                </button>
            </td>


        </tr>
    )
}

function StudentPayementDetail({studentId, onClose, onPlay}) {
    const [balance, setBalance] = useState(null)
    const [history, setHistory] = useState([])
    const [student, setStudent] = useState(null)

    useEffect(() => {
        async function load() {
            const [s, b, h] = await Promise.all([
                window.api.getStudentById(studentId),
                window.api.getPayementsBalance(studentId),
                window.api.getPayementsByStudent(studentId)
            ])
            setStudent(s)
            setBalance(b)
            setHistory(h)
        }
        load()
    }, [studentId])

    if (!student || !balance) {
        return (
            <div className="fixed inset-0 z-40 flex justify-end bg-black/20">
                <div className="w-96 bg-white h-full flex items-center justify-center text-gray-400 text-sm">
                    Chargement...
                </div>
            </div>
        )
    }

    const MOTIF_LABEL = Object.fromEntries(MOTIFS.map(m => [m.value, m.label]))

    return (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
            <div className="w-96 bg-white h-full flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold flex items-center justify-center">
                            {ini(student.nom, student.prenom)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">
                                {student.nom} {student.prenom}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                                {student.numero}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-5 border-b border-gray-100 space-y-2">
                    {[
                        ["Prix formule", fmt(balance.prix_total), "text-gray-800"],
                        ["Total payé", fmt(balance.total_paye), "text-emerald-700 font-semibold"],
                        ["Restant", balance.reste > 0 ? fmt(balance.reste) : "Soldé",
                            balance.reste > 0 ? "text-red-600 font-semibold" : "text-emerald-700 font-semibold"
                        ],
                    ].map(([k, v, cls]) => (
                        <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                            <span className="text-xs text-gray-500">{k}</span>
                            <span className={`text-sm ${cls}`}>{v}</span>
                        </div>
                    ))}

                    {balance.prix_total > 0 && (
                        <div className="pt-1">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{width: `${Math.min(100, Math.round((balance.total_paye / balance.prix_total) * 100))}%`}} />
                            </div>
                            <p className="text-right text-xs text-gray-400 mt-1">
                                {Math.min(100, Math.round((balance.total_paye / balance.prix_total) * 100))}% payé
                            </p>
                        </div>
                    )}

                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Historique</p>
                    {history.length === 0 ? (
                        <p className="text-sm text-gray-300 text-center p-y-8">Aucun paiement enregistré</p>
                    ): (
                        <div className="space-y-2">
                            {history.map(p => (
                                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-xs font-medium text-gray-700">{MOTIF_LABEL[p.motif] ?? p.motif}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{p.date_payement}</p>
                                        {p.note && <p className="text-xs text-gray-400 italic mt-0.5">{p.note}</p>}
                                    </div>
                                    <p className="text-sm font-semibold text-emerald-700">
                                        +{fmt(p.montant)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                    onClick={() => onPlay(student)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                        + Ajouter un paiement
                    </button>
                </div>

            </div>
        </div>
    )
}

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