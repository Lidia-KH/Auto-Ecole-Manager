import fmt from "./fmt"
import ini from "./ini"

export default function BalanceRow({ s, onPlay, onClick, onDelete }) {
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
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-xs font-bold text-gray-900 tracking-tight">
                                {s.nom} {s.prenom}
                                </h1>
                                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                                    {s.numero}
                                </p>
                            </div>
                        </div>
                        
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
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{width: `${pct}%`}} />
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
                onClick={e => {e.stopPropagation(); onPlay(s)}} 
                className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg">
                    + Paiement

                </button>
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center gap-2 justify-end group">
                    
                    {/* Delete */}
                    <button
                    onClick={(ev) => {
                        ev.stopPropagation();
                        onDelete?.(s.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                    title="Supprimer"
                    >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    </button>

                    {/* Edit */}
                    {/* <button
                    onClick={() => setDetailId(s.is)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
                    title="Modifier"
                    >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    </button> */}

                    {/* Chevron */}
                    <svg className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>

                </div>
            </td>


        </tr>
    )
}