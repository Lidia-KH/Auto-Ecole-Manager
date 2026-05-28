import { useState, useEffect } from "react";
import fmt from "./fmt";
import ini from "./ini";

const MOTIFS = [
    { value: "acompte", label: "Acompte inscription" },
    { value: "seance", label: "Séance conduite" },
    { value: "solde", label: "Sold total" },
    { value: "examen", label: "Frais examen" },
    { value: "autre", label: "Autre" },
]


export default function StudentPayementDetail({studentId, onClose, onPlay}) {
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
