export default function SessionStatsCard({ label, value, color = "blue" }) {
    const colors = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        amber: "bg-amber-50 text-amber-700 border-amber-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100",
        gray: "bg-gray-50 text-gray-700 border-gray-100"
    };

    return (
        <div className={`rounded-2xl border p-4 ${colors[color]}`}>
            <p className="text-xs font-semibold uppercase trackong-widest opacity-60 mb-2">
                {label}
            </p>
            <p className="text-2xl font-bold">
                {value}
            </p>
        </div>
    )
}