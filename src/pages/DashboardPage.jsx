import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboard } from '../api';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.stats().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const stats = data?.stats || {};

  const adminStats = [
    { label: 'Total Students', value: stats.total_students ?? 0, icon: '👨‍🎓' },
    { label: 'Total Internships', value: stats.total_internships ?? 0, icon: '💼' },
    { label: 'Active Internships', value: stats.active_internships ?? 0, icon: '✅' },
    { label: 'Pending Approvals', value: stats.pending_approvals ?? 0, icon: '⏳' },
    { label: 'Evaluations', value: stats.total_evaluations ?? 0, icon: '⭐' },
    { label: 'Companies', value: stats.companies ?? 0, icon: '🏢' },
  ];

  const supervisorStats = [
    { label: 'My Students', value: stats.my_students ?? 0, icon: '👨‍🎓' },
    { label: 'Active Internships', value: stats.active_internships ?? 0, icon: '✅' },
    { label: 'Pending Reports', value: stats.pending_reports ?? 0, icon: '📝' },
    { label: 'Evaluations Done', value: stats.evaluations_done ?? 0, icon: '⭐' },
  ];

  const studentStats = [
    { label: 'My Internships', value: stats.my_internships ?? 0, icon: '💼' },
    { label: 'Active', value: stats.active ?? 0, icon: '✅' },
    { label: 'Reports Submitted', value: stats.reports_submitted ?? 0, icon: '📝' },
    { label: 'Evaluations Received', value: stats.evaluations_received ?? 0, icon: '⭐' },
  ];

  const statList = role === 'admin' ? adminStats : role === 'supervisor' ? supervisorStats : studentStats;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.first_name || user?.username} — {new Date().toLocaleDateString('en-UG', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>

      <div className="stats-grid">
        {statList.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        <div className="card">
          <div className="card-title">📋 Quick Guide</div>
          {role === 'student' && (
            <ul style={{paddingLeft:'20px',lineHeight:'2',color:'#64748b'}}>
              <li>View your assigned internship under <strong>My Internships</strong></li>
              <li>Submit weekly reports under <strong>Weekly Reports</strong></li>
              <li>Check your evaluation scores under <strong>My Evaluations</strong></li>
              <li>Update your profile from the sidebar user section</li>
            </ul>
          )}
          {role === 'supervisor' && (
            <ul style={{paddingLeft:'20px',lineHeight:'2',color:'#64748b'}}>
              <li>View assigned students under <strong>Internships</strong></li>
              <li>Review and comment on <strong>Reports</strong></li>
              <li>Score students under <strong>Evaluate Students</strong></li>
              <li>Approve or reject internship applications</li>
            </ul>
          )}
          {role === 'admin' && (
            <ul style={{paddingLeft:'20px',lineHeight:'2',color:'#64748b'}}>
              <li>Manage all internships and approvals</li>
              <li>Add and manage partner <strong>Companies</strong></li>
              <li>View all <strong>Users</strong> in the system</li>
              <li>Access all evaluations and reports</li>
            </ul>
          )}
        </div>
        <div className="card">
          <div className="card-title">🔐 Account Info</div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px',color:'#374151',fontSize:'0.9rem'}}>
            <div><span style={{color:'#64748b'}}>Name: </span><strong>{user?.first_name} {user?.last_name}</strong></div>
            <div><span style={{color:'#64748b'}}>Username: </span><strong>{user?.username}</strong></div>
            <div><span style={{color:'#64748b'}}>Email: </span><strong>{user?.email}</strong></div>
            <div><span style={{color:'#64748b'}}>Role: </span><span className={`badge badge-${role}`}>{role}</span></div>
            {user?.profile?.student_number && <div><span style={{color:'#64748b'}}>Student No: </span><strong>{user.profile.student_number}</strong></div>}
            {user?.profile?.department && <div><span style={{color:'#64748b'}}>Department: </span><strong>{user.profile.department}</strong></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
