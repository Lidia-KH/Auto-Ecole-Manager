import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SessionStatsCard from "../components/sessions/SessionStatsCard";
import ini from "../components/payements/ini";
import AddSessionModal from "../components/sessions/AddSessionModal";

function formatDate(str) {
    if (!str) return "-";
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString("fr-DZ")
}

const TYPE_STYLE = {
    code: "bg-amber-50 text-amber-700 border border-amber-100",
    céneau: "bg-purple-50 text-purple-700 border border-purple-100",
    conduite: "bg-blue-50 text-blue-700 border border-blue-100",
};

const FILTERS = [
    {key: "tous", label: "Tous"},
    {key: "code", label: "Code"},
    {key: "créneau", label: "Créneau"},
    {key: "conduite", label: "onduite"}
]

export default function Sessions() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("tous");
    const [showModal, setShowModal] = useState(false);

    async function loadSessions() {
        const data = await window.api.getAllSessions();
        setSessions(data);
    }

    useEffect(() => {
        loadSessions();
    }, []);

    const totalCode = sessions.filter(s => s.type_seance === "code").length;
    const totalCreneau = sessions.filter(s => s.type_seance === "créneau").length;
    const totalConduite = sessions.filter(s => s.type_seance === "conduite").length;

    const visibleSessions = sessions.filter(s => {

        const q = search.toLowerCase();

        const matchSearch =
            !q ||
            s.nom?.toLowerCase().includes(q) ||
            s.prenom?.toLowerCase().includes(q) ||
            s.numero?.toLowerCase().includes(q);

        const matchType =
            filterType === "tous" ||
            s.type_seance === filterType;

        return matchSearch && matchType;
    });

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-8">

            <div className="max-w-6xl mx-auto space-y-6">

                <div className="flex items-start justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Séances
                        </h1>

                        <p className="text-sm text-gray-400 mt-0.5">
                            {sessions.length} séance{sessions.length !== 1 ? "s":" "} enregistrée{sessions.length !== 1 ? "s":" "}
                        </p>
                    </div>
                    {/* <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-200">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter une séance
                    </button> */}

                </div>

                <div className="grid grid-cols-4 gap-4">
                    <SessionStatsCard label="Total séances" value={sessions.length} color="gray" />
                    <SessionStatsCard label="Code" value={totalCode} color="amber" />
                    <SessionStatsCard label="Créneau" value={totalCreneau} color="purple" />
                    <SessionStatsCard label="Conduite" value={totalConduite} color="blue" />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 max-w-sm">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-300 focus:outline-none focus:ring-blue-100 focus:border-blue-400 transition-all"
                        placeholder="Rechercher un élève..."
                        value={search}
                        onChange={e => setSearch(e.target.value)} 
                        />
                        {search && (
                            <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:gray-500">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {FILTERS.map(f => {
                            const count = f.key === "tous"
                            ? sessions.length
                            : sessions.filter(s => s.type_seance === f.key).length;
                            return (
                                <button key={f.key}
                                onClick={() => setFilterType(f.key)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                    filterType === f.key
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                                    : "bg-white text-gray-500 border border-gray-200 hove:border-gray-300"
                                }`}>
                                    {f.label}
                                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                        filterType === f.key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {visibleSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                            <svg className="w-12 h-12 bm-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"  />

                            </svg>
                            <p className="text-sm">
                                Aucune séance trouvée
                            </p>
                        </div>
                    ) : (

                    

                    <table className="w-full">

                        <thead>
                            <tr className="border-b border-gray-50">

                                {["Date", "Élève", "Type", "Durée", "Note"].map(h => (
                                    <th
                                    key={h}
                                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest"
                                    >
                                        {h}
                                    </th>
                                ))}

                            </tr>
                        </thead>

                        <tbody>

                            {visibleSessions.map(s => (

                                <tr
                                key={s.id}
                                onClick={() => navigate(`/eleves/${s.student_id}`)}
                                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group"
                                >

                                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        {formatDate(s.date_seance)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold flex items-center justify-cinter flex-shrink-0">
                                                {ini(s.nom, s.prenom)}
                                            </div>
                                        
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {s.nom} {s.prenom}
                                                </p>

                                                <p className="text-xs text-gray-400 font-mono">
                                                    {s.numero}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${TYPE_STYLE[s.type_seance] ?? TYPE_STYLE.conduite}`}>
                                            {s.type_seance}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-gray-600">
                                        {s.duree ? `${s.duree} min` : "—"}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-gray-400 max-w-xs truncate">
                                        {s.note || "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        <svg className="w-4 h-4 text-gray-200 group-hover:text-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                    )}

                    {visibleSessions.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
                            <span className="text-xs text-gray-400">
                                {visibleSessions.length} séance{visibleSessions.length !==1 ? "s" : " "} affichée{visibleSessions.length !== 1 ? "s" : " "}
                            </span>
                        </div>
                    )}

                </div>

            </div>

            {showModal && (
                <AddSessionModal
                student={null}
                onClose={() => setShowModal(false)}
                onSaved={() => { setShowModal(false); loadSessions(); }} />
            )}

        </div>
    );
}