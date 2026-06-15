import { useState, useEffect } from "react"

const TYPES = ["code","créneau", "conduite"]

const TYPE_STYLE = {
  code:     "bg-amber-50 text-amber-700 border-amber-200 ring-amber-300",
  créneau:     "bg-purple-50 text-purple-700 border-purple-200 ring-purple-300",
  conduite: "bg-blue-50  text-blue-700  border-blue-200  ring-blue-300",
}

const RESULTATS = [
  { value: "en_attente", label: "En attente", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  { value: "reussi",     label: "Réussi ✓",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "echoue",     label: "Échoué ✗",   cls: "bg-red-50 text-red-700 border-red-200" },
  { value: "absent",     label: "Absent",     cls: "bg-amber-50 text-amber-700 border-amber-200" },
]

const inputCls =
  "w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 border border-gray-200 text-gray-800 " +
  "placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 " +
  "focus:border-blue-400 hover:border-gray-300 transition-all"

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

export default function EditExamenModal({ examen, onClose, onSaved, onDeleted }) {
  const [form, setForm]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [confirming, setConfirming] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    setForm({
      type_examen: examen.type_examen ?? "code",
      date_examen: examen.date_examen ?? "",
      heure:       examen.heure       ?? "",
      lieu:        examen.lieu        ?? "",
      resultat:    examen.resultat    ?? "en_attente",
      note:        examen.note        ?? "",
    })
  }, [examen])

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    await window.api.updateExam({ id: examen.id, ...form })
    setLoading(false)
    onSaved()
  }

  async function handleDelete() {
    setLoading(true)
    await window.api.deleteExam(examen.id)
    setLoading(false)
    onDeleted()
  }

  if (!form) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Modifier l'examen</h2>
            {examen.nom && (
              <p className="text-xs text-gray-400 mt-0.5">{examen.nom} {examen.prenom}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">

          {/* type */}
          <Field label="Type d'examen">
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button key={t} type="button" onClick={() => set("type_examen", t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${
                    form.type_examen === t
                      ? `${TYPE_STYLE[t]} ring-2`
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </Field>

          {/* date + heure */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input type="date" className={inputCls} value={form.date_examen}
                onChange={e => set("date_examen", e.target.value)} />
            </Field>
            <Field label="Heure">
              <input type="time" className={inputCls} value={form.heure}
                onChange={e => set("heure", e.target.value)} />
            </Field>
          </div>

          {/* lieu */}
          <Field label="Lieu">
            <input className={inputCls} placeholder="Centre d'examen…" value={form.lieu}
              onChange={e => set("lieu", e.target.value)} />
          </Field>

          {/* résultat — the key feature for setting outcome */}
          <Field label="Résultat">
            <div className="grid grid-cols-2 gap-2">
              {RESULTATS.map(r => (
                <button key={r.value} type="button" onClick={() => set("resultat", r.value)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.resultat === r.value
                      ? `${r.cls} ring-2`
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </Field>

          {/* note */}
          <Field label="Note">
            <input className={inputCls} placeholder="Remarque…" value={form.note}
              onChange={e => set("note", e.target.value)} />
          </Field>

          {/* delete confirm */}
          {confirming && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between gap-3">
              <p className="text-xs text-red-700 font-medium">Supprimer cet examen ?</p>
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" onClick={() => setConfirming(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">Non</button>
                <button type="button" onClick={handleDelete} disabled={loading}
                  className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors">
                  Oui, supprimer
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setConfirming(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50">
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}