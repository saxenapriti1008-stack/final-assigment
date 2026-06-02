import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import GymDetail from './pages/GymDetail.jsx';
import Login from './pages/Login.jsx';
import AddGym from './pages/AddGym.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gym/:id" element={<GymDetail />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/add-gym"
          element={
            <ProtectedRoute>
              <AddGym />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
