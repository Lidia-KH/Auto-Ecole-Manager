import { BrowserRouter, Routes, Route } from 'react-router-dom'
import "./index.css"
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Exams from './pages/Exams';
import Payements from './pages/Payements';
import Settings from './pages/Settings';


export default function APP() {
  return (
    <BrowserRouter>
      <div className='flex'>
        <Sidebar />

        <div className='flex-1 p-6'>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/eleves' element={<Students />} />
            <Route path='/eleves/:id' element={<StudentDetails />} />
            <Route path='/examens' element={<Exams />} />
            <Route path='/paiements' element={<Payements />} />
            <Route path='/parametres' element={<Settings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
