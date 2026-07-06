import { useState } from "react"
import { useEffect } from "react"

const inputCls =
  "w-full px-3 py-2.5 rounded-xl text-sm text-gray-800 bg-gray-50 border border-gray-200 " +
  "placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 " +
  "hover:border-gray-300 transition-all"

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function EditStudentModal({ student, formations = [], onClose, onSaved }) {
  if (!student) return null;
  const [form, setForm] = useState({
    numero:            student.numero            ?? "",
    nom:               student.nom               ?? "",
    prenom:            student.prenom            ?? "",
    date_de_naissance: student.date_de_naissance ?? "",
    telephone:         student.telephone         ?? "",
    type_permis:       student.type_permis       ?? "B",
    formation_id:      student.formation_id      ?? "",
    status:            student.status            ?? "actif",
    date_permis_obtenu: student.date_permis_obtenu  ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!student) return;

    setForm({
        numero: student.numero ?? "",
        nom: student.nom ?? "",
        prenom: student.prenom ?? "",
        date_de_naissance: student.date_de_naissance ?? "",
        telephone: student.telephone ?? "",
        type_permis: student.type_permis ?? "B",
        formation_id: student.formation_id ?? "",
        status: student.status ?? "actif",
        date_permis_obtenu: student.date_permis_obtenu  ?? "",
    })
}, [student])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave(e) {
    e.preventDefault()
    if (!form.nom.trim() || !form.prenom.trim()) return
    setLoading(true)
    await window.api.updateStudent({ id: student.id, ...form })
    if (form.formation_id) {
      await window.api.setStudentFormation({
        student_id: student.id,
        formation_id: Number(form.formation_id)
      })
    }
    setLoading(false)
    onSaved()
  }

  async function handleDelete() {
    setLoading(true)
    await window.api.deleteStudent(student.id)
    setLoading(false)
    onSaved("deleted")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Modifier l'élève</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{student.numero || `#${student.id}`}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Numéro">
              <input className={inputCls} placeholder="AE-2026-001"
                value={form.numero} onChange={e => set("numero", e.target.value)} />
            </Field>

            <Field label="Statut">
              <select className={inputCls} value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="actif">Actif</option>
                <option value="terminé">Terminé</option>
                <option value="abandonné">Abandonné</option>
                <option value="archivé">Archivé</option>
              </select>
            </Field>
            <Field label="Formation">
                <select
                className={inputCls}
                value={form.formation_id}
                onChange={e => set("formation_id", e.target.value)}>
                    <option value="">
                        Choisir une formation
                    </option>
                    {formations.map(f => (
                        <option key={f.id} value={f.id}>
                            {f.nom} - {f.prix} DA
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Nom" required>
              <input className={inputCls} placeholder="Amrani" required
                value={form.nom} onChange={e => set("nom", e.target.value)} />
            </Field>
            <Field label="Prénom" required>
              <input className={inputCls} placeholder="Karim" required
                value={form.prenom} onChange={e => set("prenom", e.target.value)} />
            </Field>
            <Field label="Téléphone">
              <input className={inputCls} placeholder="0551 23 45 67"
                value={form.telephone} onChange={e => set("telephone", e.target.value)} />
            </Field>
            <Field label="Date de naissance">
              <input type="date" className={inputCls}
                value={form.date_de_naissance} onChange={e => set("date_de_naissance", e.target.value)} />
            </Field>
            <Field label="Catégorie permis">
              <select className={inputCls} value={form.type_permis} onChange={e => set("type_permis", e.target.value)}>
                {["A","A1","B","C","C1","D","BE","CE","C1E","DE","F"].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Permis obtenu le">
              <input type="date" className={inputCls}
                value={form.date_permis_obtenu} onChange={e => set("date_permis_obtenu", e.target.value)} />
            </Field>
          </div>

          {/* delete confirm */}
          {confirming && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between gap-3">
              <p className="text-xs text-red-700 font-medium">
                Supprimer définitivement {student.nom} {student.prenom} ?
                <span className="block text-red-400 mt-0.5">Toutes les séances, examens et paiements seront supprimés.</span>
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" onClick={() => setConfirming(false)}
                  className="text-xs text-gray-500 px-2 py-1 hover:text-gray-700">Non</button>
                <button type="button" onClick={handleDelete} disabled={loading}
                  className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
                  Oui, supprimer
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
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