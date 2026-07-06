import { useEffect, useState } from "react";

const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 hover:border-gray-300 transition-all"

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function DeleteBtn({ onConfirm }) {
  const [ask, setAsk] = useState(false)
  if (ask) return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400">Supprimer ?</span>
      <button onClick={() => setAsk(false)} className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5">Non</button>
      <button onClick={onConfirm} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-lg">Oui</button>
    </div>
  )
  return (
    <button onClick={() => setAsk(true)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>
    </button>
  )
}

// ── school info ───────────────────────────────────────────────────
function SchoolInfoSection() {
  const [info, setInfo]     = useState({ nom:"", adresse:"", telephone:"", email:"", directeur:"" })
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await window.api.getSchoolInfo()
        if (data) setInfo(data)
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    await window.api.saveSchoolInfo(info)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const set = (k, v) => setInfo(i => ({ ...i, [k]: v }))

  if (loading) return null

  return (
    <SectionCard title="Informations de l'auto-école" subtitle="Apparaît sur les documents imprimés et reçus">
      <form onSubmit={handleSave} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom de l'auto-école *">
            <input className={inputCls} placeholder="Auto-École Oran" value={info.nom} onChange={e => set("nom", e.target.value)} />
          </Field>
          <Field label="Directeur / Gérant">
            <input className={inputCls} placeholder="Nom du directeur" value={info.directeur} onChange={e => set("directeur", e.target.value)} />
          </Field>
          <Field label="Téléphone *">
            <input className={inputCls} placeholder="0551 23 45 67" value={info.telephone} onChange={e => set("telephone", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputCls} placeholder="contact@autoecole.dz" value={info.email} onChange={e => set("email", e.target.value)} />
          </Field>
        </div>
        <Field label="Adresse complète">
          <input className={inputCls} placeholder="Rue, quartier, wilaya" value={info.adresse} onChange={e => set("adresse", e.target.value)} />
        </Field>
        <div className="flex justify-end pt-2">
          <button type="submit"
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-95 ${saved ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"}`}>
            {saved ? (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Enregistré</>
            ) : "Enregistrer"}
          </button>
        </div>
      </form>
    </SectionCard>
  )
}

// ── formations ────────────────────────────────────────────────────
function FormationsSection() {
  const [items, setItems]   = useState([])
  const [form, setForm]     = useState({ nom:"", prix:"", heures:"" })
  const [saving, setSaving] = useState(false)

  async function load() { setItems(await window.api.getFormations() ?? []) }
  useEffect(() => { load() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.nom.trim() || !form.prix) return
    setSaving(true)
    await window.api.addFormation({ nom: form.nom.trim(), prix: parseInt(form.prix), heures: parseInt(form.heures)||0 })
    setForm({ nom:"", prix:"", heures:"" })
    await load(); setSaving(false)
  }

  async function handlePrixBlur(id, val) {
    await window.api.updateFormation({ id, prix: parseInt(val) })
    load()
  }

  return (
    <SectionCard title="Formations / Formules" subtitle="Les packs proposés aux élèves">
      <div className="px-6 pb-2 pt-1">
        {/* col headers */}
        <div className="flex items-center gap-3 py-2 border-b border-gray-100 mb-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex-1">Nom</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest w-36">Prix (DZD)</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest w-24">Heures</p>
          <div className="w-8"/>
        </div>
        {items.length === 0 && <p className="text-sm text-gray-300 text-center py-4">Aucune formation</p>}
        {items.map(f => (
          <div key={f.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 group">
            <p className="text-sm font-medium text-gray-800 flex-1">{f.nom}</p>
            <input type="number" defaultValue={f.prix}
              onBlur={e => { if (parseInt(e.target.value) !== f.prix) handlePrixBlur(f.id, e.target.value) }}
              className="w-36 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
            <p className="text-sm text-gray-500 w-24">{f.heures}h</p>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DeleteBtn onConfirm={() => { window.api.deleteFormation(f.id).then(load) }} />
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleAdd} className="px-6 py-4 border-t border-gray-50 bg-gray-50/50">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Ajouter une formation</p>
        <div className="flex gap-3">
          <input className={inputCls} placeholder="Nom (ex: Permis B complet)" value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))} />
          <input className={`${inputCls} w-36`} type="number" placeholder="Prix DZD" value={form.prix} onChange={e => setForm(f=>({...f,prix:e.target.value}))} />
          <input className={`${inputCls} w-28`} type="number" placeholder="Heures" value={form.heures} onChange={e => setForm(f=>({...f,heures:e.target.value}))} />
          <button type="submit" disabled={saving||!form.nom.trim()||!form.prix}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex-shrink-0">
            {saving?"…":"Ajouter"}
          </button>
        </div>
      </form>
    </SectionCard>
  )
}

// ── generic simple list (moniteurs + voitures) ────────────────────
function SimpleList({ title, subtitle, items, placeholder, onAdd, onDelete, renderRow }) {
  const [value, setValue] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    if (!value.trim()) return
    setSaving(true)
    await onAdd(value.trim())
    setValue(""); setSaving(false)
  }

  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="px-6 pb-2 pt-1">
        {items.length === 0 && <p className="text-sm text-gray-300 text-center py-4">Aucun élément</p>}
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 group">
            {renderRow(item)}
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <DeleteBtn onConfirm={() => onDelete(item.id)} />
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleAdd} className="px-6 py-4 border-t border-gray-50 bg-gray-50/50">
        <div className="flex gap-3">
          <input className={inputCls} placeholder={placeholder} value={value} onChange={e => setValue(e.target.value)} />
          <button type="submit" disabled={saving||!value.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex-shrink-0">
            {saving?"…":"Ajouter"}
          </button>
        </div>
      </form>
    </SectionCard>
  )
}

function MoniteursSection() {
  const [items, setItems] = useState([])
  async function load() { setItems(await window.api.getMoniteurs() ?? []) }
  useEffect(() => { load() }, [])
  return (
    <SimpleList
      title="Moniteurs" subtitle="Instructeurs de conduite"
      items={items} placeholder="Nom du moniteur"
      onAdd={async nom => { await window.api.addMoniteur({ nom }); load() }}
      onDelete={async id => { await window.api.deleteMoniteur(id); load() }}
      renderRow={item => (
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold flex items-center justify-center">{item.nom?.[0]?.toUpperCase()}</div>
          <p className="text-sm font-medium text-gray-800">{item.nom}</p>
        </div>
      )}
    />
  )
}

function VoituresSection() {
  const [items, setItems] = useState([])
  async function load() { setItems(await window.api.getVoitures() ?? []) }
  useEffect(() => { load() }, [])
  return (
    <SimpleList
      title="Voitures" subtitle="Véhicules utilisés pour les séances"
      items={items} placeholder="Immatriculation (ex: 16-123-16)"
      onAdd={async immatriculation => { await window.api.addVoiture({ immatriculation }); load() }}
      onDelete={async id => { await window.api.deleteVoiture(id); load() }}
      renderRow={item => (
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-800 font-mono">{item.immatriculation}</p>
        </div>
      )}
    />
  )
}

export default function Settings() {
  const [machineId, setMachineId] = useState("")
  
  useEffect(() => {
    window.api.getMachineId().then(setMachineId)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Paramètres</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configuration de l'auto-école</p>
        </div>
        <SchoolInfoSection />
        <FormationsSection />
        <MoniteursSection />
        <VoituresSection />
        <div className="rounded-xl border p-4 bg-white">
          <p className="text-sm text-gray-500">
              Machine ID
          </p>

          <p className="font-mono break-all">
              {machineId}
          </p>
      </div>
      </div>
    </div>
  )
}