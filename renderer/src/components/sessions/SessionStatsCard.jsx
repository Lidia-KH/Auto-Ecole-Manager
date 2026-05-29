export default function SessionStatsCard ({sessions=[]}) {
    const totalSessions = sessions.length
    const conduiteCount = sessions.filter(s => s.type_seance === "conduite").length
    const codeCount = sessions.filter(s => s.type_seance === "code").length
    const creneauCount = sessions.filter(s => s.type_seance === "créneau").length

    const cards = [
        {
            label: "Total",
            value: totalSessions,
            bg: "bg-blue-50",
            text: "text-blue-700",
            sub: "text-blue-500"
        },
        {
            label: "Code",
            value: codeCount,
            bg: "bg-indigo-50",
            text: "text-indigo-700",
            sub: "text-indigo-500"
        },
        {
            label: "Créneau",
            value: creneauCount,
            bg: "bg-amber-50",
            text: "text-amber-700",
            sub: "text-amber-500"
        },
        {
            label: "Conduite",
            value: conduiteCount,
            bg: "bg-emerald-50",
            text: "text-emerald-700",
            sub: "text-emerald-500"
        }
    ]

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 pt-5 pb-1">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                    Statistiques des séances
                </h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
                {cards.map(c => (
                    <div key={c.label} className={`${c.bg} rounded-xl p-4`}>
                        <p className={`text-xs font-semibold uppercase tracking-widest ${c.sub}`}>
                            {c.label}
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${c.text}`}>
                            {c.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}