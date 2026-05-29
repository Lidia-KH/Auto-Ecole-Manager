export default function SessionHistoryCard({sessions=[], onAdd}) {
    return(
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 pt-5 flex items-center justify-between">
                <div>
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        Historique des séances
                    </h2>
                    <p className="text-sm text-gray-400">
                        Dernières séances enregistrées
                    </p>
                </div>
                <button onClick={onAdd} 
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
                    + Ajouter
                </button>

            </div>
            <div className="px-6 pb-6">
                {sessions.length === 0 ? (
                    <p className="text-sm text-gray-300 text-center py-8">
                        Aucune séance enregistrées
                    </p>
                ) : (
                    <div className="space-y-2">
                        {sessions.slice(0, 5).map(s => (
                            <div key={s.id}
                            className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 capitalize">
                                        {s.type_seance}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {s.date_seance}
                                    </p>
                                </div>
                                {s.note && (
                                    <span className="text-xs text-gray-400 italic">
                                        {s.note}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}