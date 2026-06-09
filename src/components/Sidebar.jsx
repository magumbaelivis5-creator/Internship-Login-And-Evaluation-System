import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  internship: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><briefcase/><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  report: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  eval: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  company: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
};

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/home', label: 'Home', icon: icons.home },
    { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { to: '/internships', label: 'My Internships', icon: icons.internship },
    { to: '/reports', label: 'Weekly Reports', icon: icons.report },
    { to: '/evaluations', label: 'My Evaluations', icon: icons.eval },
  ];

  const supervisorLinks = [
    { to: '/home', label: 'Home', icon: icons.home },
    { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { to: '/internships', label: 'Internships', icon: icons.internship },
    { to: '/reports', label: 'Reports', icon: icons.report },
    { to: '/evaluations', label: 'Evaluate Students', icon: icons.eval },
  ];

  const adminLinks = [
    { to: '/home', label: 'Home', icon: icons.home },
    { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { to: '/internships', label: 'All Internships', icon: icons.internship },
    { to: '/companies', label: 'Companies', icon: icons.company },
    { to: '/evaluations', label: 'Evaluations', icon: icons.eval },
    { to: '/users', label: 'Users', icon: icons.users },
  ];

  const links = role === 'admin' ? adminLinks : role === 'supervisor' ? supervisorLinks : studentLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>🎓 InternEval</h2>
        <p>Makerere University</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">Navigation</div>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            {link.icon} {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.first_name} {user?.last_name}</div>
        <div className="sidebar-user-role">{role}</div>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </div>
    </aside>
  );
}
