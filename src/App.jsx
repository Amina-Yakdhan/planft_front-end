import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import SmartBackButton from './components/SmartBackButton';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Library from './pages/Library';
import ProgramBuilder from './pages/ProgramBuilder';
import Nutrition from './pages/Nutrition';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <SmartBackButton />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/library" element={<Library />} />
            <Route path="/builder" element={<ProgramBuilder />} />
            <Route path="/program-builder" element={<ProgramBuilder />} />
            <Route path="/program-builder/:athleteId" element={<ProgramBuilder />} />
            <Route path="/nutrition" element={<Outlet />}>
              <Route index element={<Nutrition />} />
              <Route path="new" element={<Nutrition />} />
              <Route path="client/:clientId" element={<Nutrition />} />
              <Route path="client/:clientId/plan/new" element={<Nutrition />} />
              <Route path="client/:clientId/plan/:planId/edit" element={<Nutrition />} />
              <Route path="client/:clientId/plan/:planId" element={<Nutrition />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
