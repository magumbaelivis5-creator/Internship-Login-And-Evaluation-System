import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [regData, setRegData] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', role: 'student', student_number: '', phone: '', department: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(loginData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(regData);
      navigate('/dashboard');
    } catch (err) {
      const errs = err.response?.data;
      setError(errs ? Object.values(errs).flat().join(', ') : 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{fontSize:'3rem'}}>🎓</div>
          <h1>InternEval System</h1>
          <p>Makerere University — College of Computing</p>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab${tab==='login'?' active':''}`} onClick={()=>{setTab('login');setError('');}}>Login</button>
          <button className={`auth-tab${tab==='register'?' active':''}`} onClick={()=>{setTab('register');setError('');}}>Register</button>
        </div>
        {error && <div className="auth-error">{error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-control" placeholder="Enter your username" value={loginData.username}
                onChange={e=>setLoginData({...loginData,username:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Enter your password" value={loginData.password}
                onChange={e=>setLoginData({...loginData,password:e.target.value})} required />
            </div>
            <div style={{background:'#f0f4f8',padding:'12px',borderRadius:'8px',marginBottom:'16px',fontSize:'0.8rem',color:'#64748b'}}>
              <strong>Demo accounts:</strong><br/>
              Admin: admin / admin123 &nbsp;|&nbsp; Supervisor: dr_nakamya / super123<br/>
              Student: john_doe / student123
            </div>
            <button className="auth-submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-control" placeholder="First name" value={regData.first_name}
                  onChange={e=>setRegData({...regData,first_name:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" placeholder="Last name" value={regData.last_name}
                  onChange={e=>setRegData({...regData,last_name:e.target.value})} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-control" placeholder="Username" value={regData.username}
                  onChange={e=>setRegData({...regData,username:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" placeholder="Email" value={regData.email}
                  onChange={e=>setRegData({...regData,email:e.target.value})} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="Password" value={regData.password}
                  onChange={e=>setRegData({...regData,password:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={regData.role}
                  onChange={e=>setRegData({...regData,role:e.target.value})}>
                  <option value="student">Student</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
            </div>
            {regData.role === 'student' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Student Number</label>
                  <input className="form-control" placeholder="e.g. 20/U/001" value={regData.student_number}
                    onChange={e=>setRegData({...regData,student_number:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" placeholder="+256..." value={regData.phone}
                    onChange={e=>setRegData({...regData,phone:e.target.value})} />
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-control" placeholder="e.g. Computer Science" value={regData.department}
                onChange={e=>setRegData({...regData,department:e.target.value})} />
            </div>
            <button className="auth-submit" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
