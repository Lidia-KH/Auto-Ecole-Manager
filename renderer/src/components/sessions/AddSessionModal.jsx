import { useState } from "react"

const SEANCE_TYPES = [
    { value: "code", label: "Code" },
    { value: "créneau", label: "Créneau" },
    { value: "conduite", label: "Conduite" }
]

export default function AddSessionModal({ student, onClose, onSaved}) {
    const [form, setForm] = useState({
        type_seance: "code",
        date_seance: new Date().toLocaleDateString("sv-SE"),
        duree: "",
        note: "",
    });
    const [loading, setLoading] = useState(false);

    const set = (k, v) => 
        setForm(f => ({
            ...f,
            [k]: v
        }))

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        await window.api.addSession({
            student_id: student.id,
            type_seance: form.type_seance,
            date_seance: form.date_seance,
            duree: form.duree,
            note: form.note
        })
        setLoading(false)
        onSaved()
    }

    const inputCls = "w-full px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-blue-100 focus:border-blue-400 transition-all"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">
                            Ajouter une séance
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {student.nom} {student.prenom}
                        </p>
                    </div>
                    <button
                    onClick={onClose}
                    className="text-gray-300 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                            Type de séance
                        </label>
                        <select
                        className={inputCls}
                        value={form.type_seance}
                        onChange={e => set("type_seance", e.target.value)}>
                            {SEANCE_TYPES.map(s => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                            Date
                        </label>
                        <input className={inputCls}
                        type="date"
                        value={form.date_seance}
                        onChange={e => set("date_seance", e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                            Durée
                        </label>
                        <input className={inputCls}
                        type="text"
                        placeholder="1:30"
                        value={form.duree}
                        onChange={e => set("duree", e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                            Note (optionnel)
                        </label>
                        <input className={inputCls}
                        placeholder="Remarque..."
                        value={form.note}
                        onChange={e => set("note", e.target.value)} />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-60">
                            {loading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )

}