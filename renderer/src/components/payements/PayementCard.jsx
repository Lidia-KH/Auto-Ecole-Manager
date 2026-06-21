import { useEffect, useState } from "react";
import fmt from "./fmt";

export default function PayementCard({ studentId, onAddPayement, onEditPayment }) {
    const [balance, setBalance] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const MOTIF_LABEL = {
        acompte: "Acompte inscription",
        seance: "Séance conduite",
        solde: "Sold total",
        examen: "Frais examen",
        autre: "Autre",
    };

    async function load() {
        setLoading(true);
        const [b, h] = await Promise.all([
            window.api.getPayementsBalance(studentId),
            window.api.getPayementsByStudent(studentId),
        ]);
        setBalance(b);
        setHistory(h);
        setLoading(false);
    }

    useEffect(() => {
        load();
    
    }, [studentId]);

    if(loading) {
        return (
            <div className="bg-white rounded-2xl border-gray-100 shadow-sm p-6 text-center text-gray-300 text-sm">
                Chargement...
            </div>
        );
    }

    const pct = balance?.total_prix > 0
    ? Math.min(100, Math.round((balance.total_paye / balance.total_prix) * 100))
    : 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-50">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Paiements
                </h2>
                <button
                onClick={onAddPayement}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all active:scale-95">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Paiement
                </button>
            </div>

            <div className="px-6 py-4">
                <div className="space-y-1 mb-4">
                    {[
                        ["Prix Formule", fmt(balance?.total_prix), "text-gray-800"],
                        ["Total payé", fmt(balance?.total_paye), "text-emerald-700 font-semibold"],
                        ["Restant", (balance?.reste ?? 0) > 0 ? fmt(balance.reste) : "Soldé",
                            (balance?.reste ?? 0) > 0 ? "text-red-600 font-semibold" : "text-emerald-700 font-semibold"
                        ],
                    ].map(([k, v, cls]) => (
                        <div key={k} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                            <span className="text-xs text-gray-400">
                                {k}
                            </span>
                            <span className={`text-sm ${cls}`}>
                                {v}
                            </span>
                        </div>

                    ))}
                </div>

                {(balance?.total_prix ?? 0) > 0 && (
                    <div className="mb-5">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{width: `${pct}%`}} />
                        </div>
                        <p className="text-right text-xs text-gray-400 mt-1">
                            {pct}% payé
                        </p>
                    </div>
                )}

                {history.length === 0 ? (
                    <p className="text-xs text-gray-300 text-center py-4">
                        Aucun paiement enregistré
                    </p>
                ) : (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                            Historique
                        </p>
                        <div className="h-56 overflow-y-auto pr-1 space-y-2">
                        {history.map(p => (
                            <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                                <div className="min-w-0">

                                    <p className="text-xs font-medium text-gray-700">
                                        {MOTIF_LABEL[p.motif] ?? p.motif}
                                    </p>
                                    <span className={`
                                        text-[10px] px-2 py-0.5 rounded-full ml-2
                                        ${p.scope === "formation" ? "bg-blue-50 text-blue-600" :
                                        p.scope === "examen" ? "bg-purple-50 text-purple-600" :
                                        "bg-gray-100 text-gray-500"}
                                    `}>
                                        {p.scope}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {p.date_payement}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <p className="text-sm font-semibold text-emerald-700">
                                        +{fmt(p.montant)}
                                    </p>
                                    <button
                                    onClick={() => onEditPayment?.(p)}
                                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Modifier">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}