import fmt from "./fmt"
import ini from "./ini"

export default function BalanceRow({ s, onPlay, onClick }) {
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