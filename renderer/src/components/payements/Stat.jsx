import { useState } from "react";

export default function Stat({ label, value, color = "default" }) {
    const colors = {
        default: "text-gray-900",
        green: "text-emerald-700",
        red: "text-red-600",
        amber: "text-amber-700"
    }

    return (
        <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase trackong-widest mb-1.5">
                {label}
            </p>
            <p className={`text-xl font-semibold ${colors[color]}`}>
                {value}
            </p>
        </div>
    )
}