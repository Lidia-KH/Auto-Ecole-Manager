import { couch } from "globals";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
 

function Avatar({ nom, prenom, size = "sm" }) {
  const letters = ((nom?.[0] ?? "") + (prenom?.[0] ?? "")).toUpperCase();
  const sz = size === "sm" ? "w-9 h-9 text-xs" : "w-12 h-12 text-sm";
  return (
    <div className={`${sz} rounded-full bg-blue-50 text-blue-600 font-semibold flex items-center justify-center flex-shrink-0 select-none`}>
      {letters}
    </div>
  );
}
 
function Badge({ status }) {
  const map = {
    actif:     "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    terminé:   "bg-gray-100   text-gray-500    ring-1 ring-gray-200",
    abandonné: "bg-red-50     text-red-600     ring-1 ring-red-200",
    archivé:   "bg-amber-50   text-amber-700   ring-1 ring-amber-200",
  };
  const label = { actif: "Actif", terminé: "Terminé", abandonné: "Abandonné", archivé: "Archivé" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? map.archivé}`}>
      {label[status] ?? status}
    </span>
  );
}
 
function PermisTag({ type }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold ring-1 ring-indigo-100">
      {type}
    </span>
  );
}
 

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}
 
const inputCls =
  "w-full px-3 py-2.5 rounded-xl text-sm text-gray-800 bg-gray-50 border border-gray-200 " +
  "placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 " +
  "hover:border-gray-300 transition-all duration-150";
 

export default function Students() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [activeFilter, setActiveFilter] = useState("tous");

    const [form, setForm] = useState({
        numero: "",
        nom: "",
        prenom: "",
        date_de_naissance: "",
        telephone: "",
        type_permis: "B",
        status: "actif",
    });

    async function loadStudents(){
        const data = await window.api.getStudents();
        setStudents(data);
    }

    async function handleSearch(value) {
        setSearch(value);

        if (!value.trim()){
            loadStudents();
            return;
        }

        const data = await window.api.searchStudents(value);
        setStudents(data);
        
    }

    useEffect(() => {
        loadStudents();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        await window.api.addStudent(form);

        setForm({
            numero: "",
            nom: "",
            prenom: "",
            date_de_naissance: "",
            telephone: "",
            type_permis: "B",
            status: "actif",
        });
        setShowForm(false);
        loadStudents();
    }

    async function handleDelete(id) {
        if (!window.confirm("Supprimer cet élève ?")) 
            return;
        await window.api.deleteStudent(id);
        loadStudents();
        
    }


    const set = (k, v) => setForm( f => ({ ...f, [k]:v}));

    const FILTERS = [
        { key:"tous", label:"Tous", count:students.length },
        { key:"actif", label:"Actifs", couch:students.filter(s => s.status == "actif").length},
        { key:"terminé", label:"Terminé", couch:students.filter(s => s.status == "terminé").length},
        { key:"abandonné", label:"Abandonné", couch:students.filter(s => s.status == "abandonné").length}
    ];

    const visible = students.filter(s => activeFilter === "tous" || s.status === activeFilter);

    return(
        <div className="min-h-screen bg-[#f8f9fc] p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-start justify-between">
                    <div>

                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Eléves
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {students.length} élève{students.length !== 1 ? "s " : " "}
                            inscrits
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 
                        bg-blue-600 hover:bg-blue-700 active:scale-95
                        text-white text-sm font-semibold rounded-xl transition-all
                        duration-150 shadow-sm shadow-blue-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />

                        </svg>
                        {showForm ? "Annuler" : "Ajouter un élève"}
                    </button>
                </div>
                {showForm && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50">
                            <h2 className="text-sm font-semibold text-gray-700">Nouvel élève</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Remplissez les informations ci-dessous</p>

                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                <Field label="Numéro">
                                    <input className={inputCls} placeholder="AE-2026-01" value={form.numero} 
                                    onChange={e => set("numero", e.target.value)}/>

                                </Field>
                                <Field label="Nom">
                                    <input className={inputCls} placeholder="Nom" value={form.nom} 
                                    onChange={e => set("nom", e.target.value)}/>

                                </Field>
                                <Field label="Prénom">
                                    <input className={inputCls} placeholder="Prénom" value={form.prenom} 
                                    onChange={e => set("prenom", e.target.value)}/>

                                </Field>
                                <Field label="Date de naissance">
                                    <input type="date" className={inputCls} value={form.date_de_naissance} 
                                    onChange={e => set("date_de_naissance", e.target.value)}/>

                                </Field>
                                <Field label="Téléphone">
                                    <input className={inputCls} placeholder="0xxxxxxxxxx" value={form.telephone} 
                                    onChange={e => set("telephone", e.target.value)}/>

                                </Field>
                                <Field label="Type permis">
                                    <select className={inputCls} value={form.type_permis} 
                                    onChange={e => set("type_permis", e.target.value)}>
                                        {["A", "A1", "B", "C", "C1", "D", "BE", "CE", "C1E",  "DE", "F"]
                                        .map(p => <option key={p}>{p}</option>)}
                                    </select>

                                </Field>
                                <Field label="Status">
                                    <select className={inputCls} value={form.status} 
                                    onChange={e => set("status", e.target.value)}>
                                        <option value="actif">Actif</option>
                                        <option value="terminé">Terminé</option>
                                        <option value="abandonné">Abandonné</option>
                                        <option value="archivé">Archivé</option>

                                    </select>

                                </Field>


                            </div>
                            <div className="mt-5 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700
                                    hover:bg-gray-50 rounded-xl transition-all">
                                    Annuler
                                </button>
                                <button type="submit"
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm
                                font-semibold rounded-xl transition-all active:scale-95 shadow-blue-200">
                                    Enregistrer
                                </button>
                            </div>

                        </form>

                    </div>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />

                        </svg>
                        <input className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200
                        rounded-xl text-sm placeholder-gray-300 focus:outline-none focus:ring-2
                        focus:ring-blue-100 focus:border-blue-400 transition-all"
                        placeholder="Recherche par numéro, nom, téléphone..." 
                        value={search}
                        onChange={e => handleSearch(e.target.value)}

                        />
                        {search && (
                            <button inClick={() => handleSearch("")} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text=gray-300
                            hover:text-gray-500" >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"/>

                                </svg>

                            </button>
                        )}

                    </div>

                    <div className="flex gap-2">
                        {FILTERS.map(f => (
                            <button key={f.key} onClick={() => setActiveFilter(f.key)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all 
                            ${
                                activeFilter === f.key ? "bg-blue-600 text-white shadow-sm-shadow-blue-200"
                                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                            }`}>
                                {f.label}
                                <span className={`px-1.5 py-0.5 rounded-full text-xs 
                                    ${
                                        activeFilter === f.key ? "bg-blue-500 text-white" 
                                        : "bg-gray-100 text-gray-400"
                                    }`}>
                                    {f.count}
                                </span>

                            </button>
                        ))}

                    </div>

                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {visible.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" 
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 
                                3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />

                            </svg>
                            <p className="text-sm">Aucun élève trouvé</p>

                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    {["Elève", "Numéro", "Téléphone", "Permis", "Status", ""]
                                    .map(h => (
                                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                            {h}

                                        </th>
                                    ))}

                                </tr>
                            </thead>
                            <tbody className="divide-y devide-gray-50">
                                {visible.map(s => (
                                    <tr key={s.id} onClick={() => navigate(`/eleves/${s.id}`)} 
                                    className="group hover:bg-blue-50/40 transition-colors duration-100 cursor-pointer">

                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <Avatar nom={s.nom} prenom={s.prenom} />

                                            
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {s.nom} {s.prenom}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {s.date_de_naissance || "—"}
                                                    </p>
                                                </div>
                                            </div>

                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600">
                                            {s.numero}
                                        </td>

                                        <td className="px-5 py-3.5 text-sm text-gray-600">
                                            {s.telephone}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <PermisTag type={s.type_permis} />
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Badge status={s.status} />
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                onClick={e => {e.stopPropagation(); navigate(`/eleves/${s.id}`);}}
                                                className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-colors"
                                                title="Voir le profil">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                    </svg>

                                                </button>
                                                <button
                                                onClick={e => {e.stopPropagation(); handleDelete(s.id);}}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                                                title="Supprimer">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>

                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    )}

                </div>
                {visible.length > 0 && (
                    <p className="text-xs text-gray-400 text-right">
                        {visible.length} élève{visible.length !== 1 ? "s " : " "} 
                        affiché{visible.length !== 1 ? "s" : ""}
                    </p>
                )}
                
            </div>
        </div>
                                
    )                            
}