import { useEffect, useState } from "react";
import SessionStatsCard from "../components/sessions/SessionStatsCard";

export default function Sessions() {

    const [sessions, setSessions] = useState([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("tous");

    async function loadSessions() {
        const data = await window.api.getAllSessions();
        setSessions(data);
    }

    useEffect(() => {
        loadSessions();
    }, []);

    const visibleSessions = sessions.filter(s => {

        const q = search.toLowerCase();

        const matchSearch =
            !q ||
            s.nom.toLowerCase().includes(q) ||
            s.prenom.toLowerCase().includes(q) ||
            s.numero?.toLowerCase().includes(q);

        const matchType =
            filterType === "tous" ||
            s.type_seance === filterType;

        return matchSearch && matchType;
    });

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-8">

            <div className="max-w-6xl mx-auto space-y-6">

                <div className="flex items-start justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Séances
                        </h1>

                        <p className="text-sm text-gray-400 mt-0.5">
                            Gestion des séances
                        </p>
                    </div>

                </div>

                <SessionStatsCard sessions={sessions} />

                <div className="flex gap-3">

                    <input
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                    placeholder="Rechercher un élève..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    />

                    <select
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="tous">Tous</option>
                        <option value="code">Code</option>
                        <option value="créneau">Créneau</option>
                        <option value="conduite">Conduite</option>
                    </select>

                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                    <table className="w-full">

                        <thead>
                            <tr className="border-b border-gray-50">

                                {["Date", "Élève", "Type", "Durée", "Note"].map(h => (
                                    <th
                                    key={h}
                                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest"
                                    >
                                        {h}
                                    </th>
                                ))}

                            </tr>
                        </thead>

                        <tbody>

                            {visibleSessions.map(s => (

                                <tr
                                key={s.id}
                                className="border-b border-gray-50 hover:bg-gray-50"
                                >

                                    <td className="px-5 py-4 text-sm text-gray-600">
                                        {s.date_seance}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                {s.nom} {s.prenom}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {s.numero}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700">
                                            {s.type_seance}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-gray-600">
                                        {s.duree || "—"}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-gray-400">
                                        {s.note || "—"}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}