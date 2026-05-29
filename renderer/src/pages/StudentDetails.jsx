import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddPayementModal from "../components/payements/AddPayementModal"
import AddSessionModal from "../components/sessions/AddSessionModal";
import SessionStatsCard from "../components/sessions/SessionStatsCard";
import SessionHistoryCard from "../components/sessions/SessionHistoryCard";

const SEANCE_TYPES = [
        "code",
        "créneau",
        "conduite"
    ]

function InfoRow( { label, value, mono = false }) {
    return(
        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {label}
            </span>
            <span className={`text-sm font-meduim text-gray-800 ${mono ? 
                "font-mono bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100" : ""}`}>
                {value || "—"}
            </span>

        </div>
    );

}

const STATUS_STYLE = {
    actif: "bg-emerald-50 text-emerald-700 right-1 ring-emerald-200",
    terminé: "bg-gray-100 text-gray-500 right-1 ring-gray-200",
    abandinné: "bg-red-50 text-red-600 right-1 ring-red-200",
    archivé: "bg-amber-50 text-amber-700 right-1 ring-amber-200",
};

export default function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [showPayement, setShowPayement] = useState(false);
    const [showSession, setShowSession] = useState(false);
    const [sessions, setSessions] = useState([])

    useEffect(() => {
        async function loadStudent() {
            const [studentData, sessionsData] = await Promise.all([
                window.api.getStudentById(id),
                window.api.getSessionByStudent(id)
            ])
            setStudent(studentData);
            setSessions(sessionsData);
            
        }
        loadStudent();
    }, [id]);

    if(!student) {
        return(
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-400">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-sm">Chargement...</span>

                </div>

            </div>
        );
    }

    const initials = ((student.nom?.[0] ?? "") + (student.prenom?.[0] ?? "")).toUpperCase();

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-8">
            <div className="max-w-5xl mx-auto space-y-5">
                <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors group">
                    <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour aux élèves
                </button>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="h-20 bg-gradient-to-r from-blue-50 to-indigo-50" />
                    <div className="px-6 pb-6 -mt-10">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 text-xl font-bold
                        flex items-center justify-center ring-4 ring-white mb-4 shadow-sm">
                            {initials}
                        </div>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {student.nom} {student.prenom}
                                </h1>
                                <p className="text-sm text-gray-400 mt-0.5 font-mono">
                                    {student.numero || "Numéro non défini"}
                                </p>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold 
                                ${STATUS_STYLE[student.status] ?? STATUS_STYLE.archivé}`}>
                                {student.status}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="px-6 pt-5 pb-1">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                            Informations
                        </h2>
                    </div>
                    <div className="px-6 pb-4">
                        <InfoRow label="Téléphone" value={student.telephone} />
                        <InfoRow label="Permis" value={`Type ${student.type_permis}`} />
                        <InfoRow label="Date de naissance" value={student.date_de_naissance} />
                        <InfoRow label="Date d'inscription" value={student.date_inscription?.split("T")[0]} />

                    </div>
                </div>

                <SessionStatsCard sessions={sessions} />
                <SessionHistoryCard sessions={sessions} onAdd={() => setShowSession(true)} />

                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Actions rapides
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "Ajouter une séance", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6", color:"blue" },
                        { label: "Enregistrer paiement",  icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", color: "emerald" },
                        { label: "Inscrire à un examen",  icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "indigo" },
                        { label: "Notifier WhatsApp",     icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", color: "green"  },

                    ].map(({ label, icon, color}) => (
                        <button key={label} className={`
                        flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all 
                        hover:shadow-sm active:scale-[.98]
                        ${color === "blue" ? "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" : ""}
                        ${color === "emerald" ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100": ""}
                        ${color === "indigo" ? "border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100": ""}
                        ${color === "green" ? "border-green-100 bg-green-50 text-green-700 hover:bg-green-100" : ""}`}
                        onClick={() => {
                            if(label === "Ajouter une séance") { setShowSession(true) }
                            if(label === "Enregistrer paiement"){ setShowPayement(true) }
                            
                        }}>
                        
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                            </svg>
                            {label}
                        </button>
                    )
                    )}

                </div>

                {showSession && (
                    <AddSessionModal
                        student={student}
                        onClose={() => setShowSession(false)}
                        onSaved={async () => {
                            const updated = await window.api.getSessionByStudent(student.id)
                            setSessions(updated)
                            setShowSession(false)
                        }} />
                )}

                {showPayement && (
                    <AddPayementModal
                        student={student}
                        onClose={() => setShowPayement(false)}
                        onSaved={() => { setShowPayement(false) }} />
                )}

            </div>

        </div>
    );

}