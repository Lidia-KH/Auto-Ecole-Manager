import { useState, useEffect, useRef } from "react"

const TYPES    = ["code", "créneau", "conduite"]
const RESULTATS = [
  { value: "en_attente", label: "En attente", style: "bg-gray-100 text-gray-600" },
  { value: "reussi",     label: "Réussi",     style: "bg-emerald-50 text-emerald-700" },
  { value: "echoue",     label: "Échoué",     style: "bg-red-50 text-red-700" },
  { value: "absent",     label: "Absent",     style: "bg-amber-50 text-amber-700" },
]

const TYPE_STYLE = {
  code:     "bg-amber-50 text-amber-700 border-amber-200 ring-amber-300",
  créneau:     "bg-purple-50 text-purple-700 border-purple-200 ring-purple-300",
  conduite: "bg-blue-50  text-blue-700  border-blue-200  ring-blue-300",
}

const inputCls =
  "w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 border border-gray-200 text-gray-800 " +
  "placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 " +
  "focus:border-blue-400 hover:border-gray-300 transition-all"

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

// student search picker
function StudentPicker({ value, onChange, exclude = [] }) {
  const [query, setQuery]     = useState(value ? `${value.nom} ${value.prenom}` : "")
  const [results, setResults] = useState([])
  const [open, setOpen]       = useState(false)
  const ref                   = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function search(q) {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    const data = await window.api.searchStudents(q)
    setResults(data.filter(s => !exclude.includes(s.id)))
    setOpen(true)
  }

  function pick(s) {
    onChange(s)
    setQuery(`${s.nom} ${s.prenom}`)
    setOpen(false)
    setResults([])
  }

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input className={`${inputCls} pl-9`} placeholder="Rechercher un élève…"
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => query && setOpen(true)} />
        {query && (
          <button type="button" onClick={() => { setQuery(""); onChange(null); setResults([]) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {results.map(s => (
            <button key={s.id} type="button" onClick={() => pick(s)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {(s.nom[0] + s.prenom[0]).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{s.nom} {s.prenom}</p>
                <p className="text-xs text-gray-400 font-mono">{s.numero}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// shared fields (date, heure, lieu)
function SharedFields({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  return (
    <div className="space-y-4">
      <Field label="Type d'examen" required>
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button key={t} type="button" onClick={() => set("type_examen", t)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${
                data.type_examen === t
                  ? `${TYPE_STYLE[t]} ring-2`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" required>
          <input type="date" className={inputCls} value={data.date_examen}
            onChange={e => set("date_examen", e.target.value)} />
        </Field>
        <Field label="Heure">
          <input type="time" className={inputCls} value={data.heure}
            onChange={e => set("heure", e.target.value)} />
        </Field>
      </div>
      <Field label="Lieu (centre d'examen)">
        <input className={inputCls} placeholder="Ex: Centre Oran, Wilaya 31…"
          value={data.lieu} onChange={e => set("lieu", e.target.value)} />
      </Field>
    </div>
  )
}

// Single mode
function SingleForm({ prefillStudent, onSubmit, onClose }) {
  const [shared, setShared] = useState({
    type_examen: "code",
    date_examen: new Date().toLocaleDateString("sv-SE"),
    heure: "", lieu: "",
  })
  const [student, setStudent] = useState(prefillStudent ?? null)
  const [note, setNote]       = useState("")
  const [loading, setLoading] = useState(false)
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);

  async function handleSubmit(e) {
    e.preventDefault()
    if (!student) return
    setLoading(true)
    await window.api.addExam({
      student_id:  student.id,
      type_examen: shared.type_examen,
      date_examen: shared.date_examen,
      heure:       shared.heure,
      lieu:        shared.lieu,
      resultat:    "en_attente",
      note,
    })
    if (notifyWhatsapp && student.telephone) {
      const msg =
        `Bonjour ${student.nom} ${student.prenom},\n\n` +
        `Votre examen de ${shared.type_examen} est programmé le ${shared.date_examen}` +
        `${shared.heure ? ` à ${shared.heure}` : ""}.` +
        `${shared.lieu ? `\nLieu : ${shared.lieu}` : ""}\n\nAuto-école.`;

      const cleanPhone = student.telephone.replace(/^0/, "213").replace(/\D/g, "")

      window.open(
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`,
        "_blank"
      );
    }
    setLoading(false)
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <Field label="Élève" required>
        {prefillStudent ? (
          <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
              {(prefillStudent.nom[0] + prefillStudent.prenom[0]).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">{prefillStudent.nom} {prefillStudent.prenom}</p>
              <p className="text-xs text-blue-500 font-mono">{prefillStudent.numero}</p>
            </div>
          </div>
        ) : (
          <StudentPicker value={student} onChange={setStudent} />
        )}
      </Field>

      <SharedFields data={shared} onChange={setShared} />

      <Field label="Note">
        <input className={inputCls} placeholder="Remarque…" value={note}
          onChange={e => setNote(e.target.value)} />
      </Field>

      <div className="flex items-center gap-2 px-1">
        <input
          id="notifyWhatsapp"
          type="checkbox"
          checked={notifyWhatsapp}
          onChange={(e) => setNotifyWhatsapp(e.target.checked)}
          className="w-4 h-4"
        />
        <label
          htmlFor="notifyWhatsapp"
          className="text-sm text-gray-600 cursor-pointer"
        >
          Notifier l'élève par WhatsApp
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={!student || !shared.date_examen || loading}
          className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50">
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  )
}

// ── Bulk mode 
function BulkForm({ onSubmit, onClose }) {
  const [shared, setShared] = useState({
    type_examen: "code",
    date_examen: new Date().toLocaleDateString("sv-SE"),
    heure: "", lieu: "",
  })
  const [rows, setRows]     = useState([{ id: Date.now(), student: null, note: "" }])
  const [loading, setLoading] = useState(false)

  const selectedIds = rows.map(r => r.student?.id).filter(Boolean)
  const allFilled   = rows.length > 0 && rows.every(r => r.student)

  function addRow() {
    setRows(r => [...r, { id: Date.now(), student: null, note: "" }])
  }
  function removeRow(id) {
    setRows(r => r.filter(x => x.id !== id))
  }
  function updateRow(id, k, v) {
    setRows(r => r.map(x => x.id === id ? { ...x, [k]: v } : x))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!allFilled) return
    setLoading(true)
    await window.api.addExamsBulk(
      rows.map(r => ({
        student_id:  r.student.id,
        type_examen: shared.type_examen,
        date_examen: shared.date_examen,
        heure:       shared.heure,
        lieu:        shared.lieu,
        resultat:    "en_attente",
        note:        r.note,
      }))
    )
    setLoading(false)
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {/* shared */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Paramètres communs</p>
        <SharedFields data={shared} onChange={setShared} />
      </div>

      {/* rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Candidats ({rows.length})
          </p>
          <button type="button" onClick={addRow}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un candidat
          </button>
        </div>

        {rows.map((row, idx) => (
          <div key={row.id} className="p-3 bg-white border border-gray-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Candidat {idx + 1}</span>
              {rows.length > 1 && (
                <button type="button" onClick={() => removeRow(row.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <StudentPicker
              value={row.student}
              exclude={selectedIds.filter(id => id !== row.student?.id)}
              onChange={s => updateRow(row.id, "student", s)}
            />
            <Field label="Note (optionnel)">
              <input className={inputCls} placeholder="Remarque…" value={row.note}
                onChange={e => updateRow(row.id, "note", e.target.value)} />
            </Field>
          </div>
        ))}
      </div>

      {rows.some(r => r.student) && (
        <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-700 font-medium">
            {rows.filter(r => r.student).length} candidat{rows.filter(r => r.student).length > 1 ? "s" : ""}
            — {shared.type_examen} — {shared.date_examen}
            {shared.lieu ? ` — ${shared.lieu}` : ""}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={!allFilled || loading}
          className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50">
          {loading ? "Enregistrement…" : `Inscrire ${rows.length} candidat${rows.length > 1 ? "s" : ""}`}
        </button>
      </div>
    </form>
  )
}

// ── Main modal 
export default function AddExamenModal({ student, onClose, onSaved }) {
  const [mode, setMode] = useState("single")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Inscrire à un examen</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {student ? `${student.nom} ${student.prenom}` : "Choisir le mode"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!student && (
          <div className="flex gap-1 mx-6 mt-4 p-1 bg-gray-100 rounded-xl flex-shrink-0">
            {[{ key: "single", label: "Un candidat" }, { key: "bulk", label: "Plusieurs candidats" }].map(m => (
              <button key={m.key} type="button" onClick={() => setMode(m.key)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === m.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
                {m.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {mode === "single"
            ? <SingleForm prefillStudent={student} onSubmit={onSaved} onClose={onClose} />
            : <BulkForm onSubmit={onSaved} onClose={onClose} />
          }
        </div>
      </div>
    </div>
  )
}