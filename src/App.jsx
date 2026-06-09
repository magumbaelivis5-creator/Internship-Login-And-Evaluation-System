import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import InternshipsPage from './pages/InternshipsPage';
import ReportsPage from './pages/ReportsPage';
import EvaluationsPage from './pages/EvaluationsPage';
import CompaniesPage from './pages/CompaniesPage';
import UsersPage from './pages/UsersPage';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',fontSize:'1.1rem',color:'#64748b'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user, role } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/home" element={<ProtectedLayout><HomePage /></ProtectedLayout>} />
      <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/internships" element={<ProtectedLayout><InternshipsPage /></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
      <Route path="/evaluations" element={<ProtectedLayout><EvaluationsPage /></ProtectedLayout>} />
      <Route path="/companies" element={<ProtectedLayout><CompaniesPage /></ProtectedLayout>} />
      <Route path="/users" element={<ProtectedLayout><UsersPage /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
