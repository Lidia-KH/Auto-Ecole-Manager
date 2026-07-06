import { BrowserRouter, Routes, Route } from 'react-router-dom'
import "./index.css"
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Sessions from './pages/Sessions';
import Exams from './pages/Exams';
import Payements from './pages/Payements';
import Settings from './pages/Settings';
import { useEffect, useState } from 'react';

import Activation from './pages/Activation';



export default function APP() {
  const [licensed, setLicensed] = useState(null);

  useEffect(() => {
    window.api.isAppLicensed().then(setLicensed);
  }, []);

  if (licensed === null) {
    return null
  }

  if (!licensed) {
    return <Activation />;
  }

  return (
    <BrowserRouter>
      <div className='flex'>
        <Sidebar />
        <main className="ml-72 flex-1 min-h-screen bg-slate-50">
          <div className="max-w-7xl mx-auto p-8">
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/eleves' element={<Students />} />
              <Route path='/eleves/:id' element={<StudentDetails />} />
              <Route path='/seances' element={<Sessions />} />
              <Route path='/examens' element={<Exams />} />
              <Route path='/paiements' element={<Payements />} />
              <Route path='/parametres' element={<Settings />} />
            </Routes>
          </div>
        </main>

      </div>
    </BrowserRouter>
  );
}
