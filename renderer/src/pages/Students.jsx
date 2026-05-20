import { useEffect, useState } from "react";

export default function Students() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        numero: "",
        nom: "",
        prenom: "",
        date_de_naissance: "",
        telephone: "",
        type_permis: "B",
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
        setStudents(dara);
        
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
        });

        loadStudents();
    }

    async function handleDelete(id) {
        await window.api.deleteStudent(id);
        loadStudents();
        
    }

    return(
        <div>
            <h1 className="text-3xl font-bold mb-6">
                Students
            </h1>

            <input 
                placeholder="Search student..."
                className="border p-2 mb-4 w-full"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
            />

            <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
                <input placeholder="Numero"
                        className="border p-2"
                        value={form.numero}
                        onChange={(e) => setForm({ ...form, numero: e.target.value})}
                
                />
                <input placeholder="Nom"
                        className="border p-2"
                        value={form.nom}
                        onChange={(e) => setForm({ ...form, nom: e.target.value})}
                
                />
                <input placeholder="Prenom"
                        className="border p-2"
                        value={form.prenom}
                        onChange={(e) => setForm({ ...form, prenom: e.target.value})}
                
                />
                <input type="date"
                        className="border p-2"
                        value={form.date_de_naissance}
                        onChange={(e) => setForm({ ...form, date_de_naissance: e.target.value})}
                
                />
                <input placeholder="Telephone"
                        className="border p-2"
                        value={form.telephone}
                        onChange={(e) => setForm({ ...form, telephone: e.target.value})}
                
                />
                <select placeholder="Type_permis"
                        className="border p-2"
                        value={form.type_permis}
                        onChange={(e) => setForm({ ...form, type_permis: e.target.value})}
                >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>

                </select>
                <button className="bg-black text-white px-4">Ajouter</button>
            </form>

            <table className="w-full border">
                <thead className="bg-gray-100">
                    <tr>
                        <th>ID</th>
                        <th>Numero</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Date de naissance</th>
                        <th>Téléphone</th>
                        <th>Permis</th>
                    </tr>

                </thead>

                <tbody>
                    {students.map((s) => (
                        <tr key={s.id} className="border-t">
                            <td>{s.id}</td>
                            <td>{s.numero}</td>
                            <td>{s.nom}</td>
                            <td>{s.prenom}</td>
                            <td>{s.date_de_naissance}</td>
                            <td>{s.telephone}</td>
                            <td>{s.type_permis}</td>
                            <td>
                                <button onClick={() => handleDelete(s.id)}
                                    className="bg-red-500 text-white px-2 py-1"
                                    >Suprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
}