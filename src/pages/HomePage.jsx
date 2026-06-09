import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <div className="home-hero">
        <h1>🎓 Internship Evaluation System</h1>
        <p>Makerere University's platform for managing, tracking, and evaluating student industrial training placements efficiently and transparently.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard →
        </button>
      </div>

      <div style={{marginBottom:'32px'}}>
        <h2 style={{marginBottom:'16px',fontSize:'1.3rem'}}>Welcome back, {user?.first_name || user?.username}!</h2>
        <div className="home-features">
          {[
            { icon: '🏢', title: 'Company Management', desc: 'Track and manage partner companies offering internship positions to students.' },
            { icon: '📋', title: 'Internship Tracking', desc: 'Monitor all active, pending, and completed internships in real-time.' },
            { icon: '📝', title: 'Weekly Reports', desc: 'Students submit weekly activity reports reviewed by supervisors.' },
            { icon: '⭐', title: 'Evaluation System', desc: 'Supervisors grade students on technical skills, teamwork, and more.' },
            { icon: '📊', title: 'Analytics Dashboard', desc: 'Comprehensive statistics and insights for administrators and supervisors.' },
            { icon: '🔐', title: 'Role-Based Access', desc: 'Secure access control for students, supervisors, and administrators.' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">About the System</div>
        <p style={{color:'#64748b',lineHeight:'1.7'}}>
          The InternEval System was developed as part of the CSC 1202 Software Development Project coursework at
          Makerere University, College of Computing and Informatics Technology. It uses React for the frontend
          and Django REST Framework for the backend API, demonstrating modern full-stack web development practices
          with separated concerns and RESTful API design.
        </p>
      </div>
    </div>
  );
}
