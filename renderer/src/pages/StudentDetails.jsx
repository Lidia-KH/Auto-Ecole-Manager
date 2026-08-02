import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddPayementModal from "../components/payements/AddPayementModal"
import AddSessionModal from "../components/sessions/AddSessionModal";
import SessionStatsCard from "../components/sessions/SessionStatsCard";
import SessionHistoryCard from "../components/sessions/SessionHistoryCard";
import PayementCard from "../components/payements/PayementCard";
import ExamStatsCard from "../components/exams/ExamStatsCard";
import StudentExamHistoryCard from "../components/exams/StudentExamHistoryCard";
import AddExamenModal from "../components/exams/AddExamsModal";
import EditExamenModal from "../components/exams/EditExamModal";
import EditPaymentModal from "../components/payements/EditPayementModal";
import EditSessionModal from "../components/sessions/EditSessionModal";

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
    actif: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    terminé: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
    abandonné: "bg-red-50 text-red-600 ring-1 ring-red-200",
    archivé: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};


const COLOR_MAP = {
  blue:    "border-blue-100    bg-blue-50    text-blue-700    hover:bg-blue-100",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  indigo:  "border-indigo-100  bg-indigo-50  text-indigo-700  hover:bg-indigo-100",
  green:   "border-green-100   bg-green-50   text-green-700   hover:bg-green-100",
};


export default function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [showPayement, setShowPayement] = useState(false);
    const [showSession, setShowSession] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [editingSession, setEditingSession] = useState(null);
    const [payementKey, setPayementKey] = useState(0);
    const [exams, setExams] = useState([]);
    const [showExam, setShowExam] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [showWhatsapp, setShowWhatsapp] = useState(false);
    const [whatsappMessage, setWhatsappMessage] = useState(
    `Bonjour ${student?.nom ?? ""} ${student?.prenom ?? ""}, je vous contacte depuis l'auto-école.`
    );
    const [editingPayment, setEditingPayment] = useState(null);

    useEffect(() => {
        async function loadStudent() {
            const [studentData, sessionsData, examsData] = await Promise.all([
                window.api.getStudentById(id),
                window.api.getSessionByStudent(id),
                window.api.getExamsByStudent(id)
            ])
            setStudent(studentData);
            setSessions(sessionsData);
            setExams(examsData);
            
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

    async function handlePermisObtenu() {
        const datePermisObtenu = new Date().toISOString().split("T")[0];
        await window.api.updateStudent({
            id: student.id,
            numero: student.numero,
            nom: student.nom,
            prenom: student.prenom,
            date_de_naissance: student.date_de_naissance,
            telephone: student.telephone,
            type_permis: student.type_permis,
            status: "archivé",
            date_permis_obtenu: datePermisObtenu,
        });
        setStudent(s => ({ ...s, status: "archivé", date_permis_obtenu: datePermisObtenu }));
    }

    async function handleExportWord() {
        await window.api.exportCandidateForms([student.id]);
        }
        async function handleExportExamList() {
        await window.api.exportExamList([student.id], {
            centreExamen: "",
            dateExamen: new Date().toISOString().split("T")[0],
        });
    }

    const ACTION_BUTTONS = [
        {
        label: "Ajouter une séance",
        color: "blue",
        icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
        onClick: () => setShowSession(true),
        },
        {
        label: "Enregistrer paiement",
        color: "emerald",
        icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
        onClick: () => setShowPayement(true),
        },
        {
        label: "Inscrire à un examen",
        color: "indigo",
        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
        onClick: () => setShowExam(true),
        },
        {
        label: "Notifier WhatsApp",
        color: "green",
        icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
        onClick: () => {
            setWhatsappMessage(
                `Bonjour ${student.nom} ${student.prenom}, je vous contacte depuis l'auto-école.`
            );

            setShowWhatsapp(true);
        },
        },
        {
        label: "Exporter fiche (Word)",
        color: "blue",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        onClick: handleExportWord,
        },
        {
        label: "Exporter liste examen (Excel)",
        color: "emerald",
        icon: "M9 17v-2a4 4 0 014-4h4m-4-4h4m-4 8h4m-9 4h.01M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9l-6-6H9z",
        onClick: handleExportExamList,
        },
    ]


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


                <div className="grid grid-cols-2 gap-5">
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
                            {student.status === "archivé" && student.date_permis_obtenu && (
                                <InfoRow label="Permis obtenu le" value={student.date_permis_obtenu} />
                            )}

                        </div>

                        {student.status !== "archivé" && (
                            <div className="px-6 pb-5">
                                <button
                                onClick={handlePermisObtenu}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-200 transition-all active:scale-[.98]"
                                >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                Permis obtenu 
                                </button>
                            </div>
                        )}
                        
                    </div>
                    <PayementCard
                        key={payementKey}
                        studentId={student.id}
                        onAddPayement={() => setShowPayement(true)}
                        onEditPayment={setEditingPayment} />
                </div>

                <SessionStatsCard 
                sessions={sessions} 
                />
                <SessionHistoryCard 
                sessions={sessions} 
                onAdd={() => setShowSession(true)} 
                onEdit={e => setEditingSession(e)}
                />

                <ExamStatsCard
                exams={exams} />

                <StudentExamHistoryCard
                exams={exams}
                onAdd={() => setShowExam(true)}
                onEdit={e => setEditingExam(e)} />

                <div>
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                        Actions rapides
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        {ACTION_BUTTONS.map(({ label, icon, color, onClick}) => (
                            <button key={label} onClick={onClick} className={`
                            flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all 
                            hover:shadow-sm active:scale-[.98] ${COLOR_MAP[color]}`}
                            >
                            
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                </svg>
                                {label}
                            </button>
                        )
                        )}

                    </div>
                </div>

                
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
                    onSaved={() => { setShowPayement(false); setPayementKey(k => k + 1); }} />
            )}

            {showExam && (
                <AddExamenModal
                student={student}
                onClose={() => setShowExam(false)}
                onSaved={async () => {
                    const updated = await window.api.getExamsByStudent(student.id)
                    setExams(updated)
                    setShowExam(false)
                }} />
            )}

            {editingExam && (
                <EditExamenModal
                examen={editingExam}
                onClose={() => setEditingExam(null)}
                onSaved={async () => {
                    const updated = await window.api.getExamsByStudent(student.id)
                    setExams(updated)
                    setEditingExam(null)
                }}
                onDeleted={async () => {
                    const updated = await window.api.getExamsByStudent(student.id)
                    setExams(updated)
                    setEditingExam(null)
                }} />
            )}

            {editingSession && (
                <EditSessionModal
                    session={editingSession}
                    onClose={() => setEditingSession(null)}
                    onSaved={async () => {
                    const updated = await window.api.getSessionByStudent(student.id)
                    setSessions(updated)
                    setEditingSession(null)
                    }}
                    onDeleted={async () => {
                    const updated = await window.api.getSessionByStudent(student.id)
                    setSessions(updated)
                    setEditingSession(null)
                    }}
                />
            )}

            {editingPayment && (
            <EditPaymentModal
                payment={editingPayment}
                onClose={() => setEditingPayment(null)}
                onSaved={() => {
                setEditingPayment(null);
                setPayementKey(k => k + 1);
                }}
                onDeleted={() => {
                setEditingPayment(null);
                setPayementKey(k => k + 1);
                }}
            />
            )}

            {showWhatsapp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-4">
                        Message WhatsApp
                    </h3>

                    <textarea
                        rows={8}
                        value={whatsappMessage}
                        onChange={(e) => setWhatsappMessage(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 resize-none"
                    />

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                        onClick={() => setShowWhatsapp(false)}
                        className="px-4 py-2 border border-gray-200 rounded-xl"
                        >
                        Annuler
                        </button>

                        <button
                        onClick={() => {
                            const cleanPhone = student.telephone.replace(/^0/, "213").replace(/\D/g, "")
                            window.open(
                            `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                whatsappMessage
                            )}`,
                            "_blank"
                            );

                            setShowWhatsapp(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl"
                        >
                        Ouvrir WhatsApp
                        </button>
                    </div>
                    </div>
                </div>
                )}


        </div>
    );

}