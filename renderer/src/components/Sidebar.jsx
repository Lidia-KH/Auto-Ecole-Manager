import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <div className="w-64 min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-xl font-bold mb-6">Auto École</h1>

            <nav className="flex flex-col gap-3">
                <Link to="/">Tableau de bord</Link>
                <Link to="/eleves">Élèves</Link>
                <Link to="/seances">Séances</Link>
                <Link to="/examens">Examens</Link>
                <Link to="/paiements">Paiements</Link>
                <Link to="/parametres">Parametres</Link>
            </nav>

        </div>
    );
}