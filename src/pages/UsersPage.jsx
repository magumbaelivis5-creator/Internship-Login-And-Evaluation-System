import { useState, useEffect } from 'react';
import { users } from '../api';

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    users.list(filter || undefined).then(r => setItems(r.data)).finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div>
      <div className="page-header flex-between">
        <div><h1>System Users</h1><p>All registered users in the InternEval system</p></div>
        <select className="form-control" style={{width:'auto'}} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="supervisor">Supervisors</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Student No.</th><th>Department</th></tr>
            </thead>
            <tbody>
              {items.map((u, i) => (
                <tr key={u.id}>
                  <td>{i+1}</td>
                  <td><strong>{u.first_name} {u.last_name}</strong></td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.profile?.role||'student'}`}>{u.profile?.role||'student'}</span></td>
                  <td>{u.profile?.student_number || '—'}</td>
                  <td>{u.profile?.department || '—'}</td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan="7"><div className="empty">No users found.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
