import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reports as reportsApi, internships as internshipsApi } from '../api';

export default function ReportsPage() {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [myInternships, setMyInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ internship:'', week_number:1, activities:'', challenges:'', achievements:'' });

  const load = () => {
    Promise.all([reportsApi.list(), internshipsApi.list()])
      .then(([r, i]) => { setItems(r.data); setMyInternships(i.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ internship:'',week_number:1,activities:'',challenges:'',achievements:'' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ internship:item.internship, week_number:item.week_number, activities:item.activities, challenges:item.challenges, achievements:item.achievements, supervisor_comment:item.supervisor_comment||'', status:item.status }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await reportsApi.update(editing.id, form);
    else await reportsApi.create(form);
    setShowModal(false); load();
  };

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Weekly Reports</h1>
          <p>{role === 'student' ? 'Submit and track your weekly activity reports' : 'Review student weekly reports'}</p>
        </div>
        {role === 'student' && <button className="btn btn-primary" onClick={openCreate}>+ Submit Report</button>}
      </div>

      <div className="card">
        <div className="table-container">
          {items.length === 0 ? (
            <div className="empty">No reports found. {role === 'student' && 'Submit your first weekly report!'}</div>
          ) : (
            <table>
              <thead>
                <tr><th>Week</th><th>Internship ID</th><th>Activities Summary</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id}>
                    <td><strong>Week {r.week_number}</strong></td>
                    <td>#{r.internship}</td>
                    <td style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.activities}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td style={{fontSize:'0.8rem',color:'#64748b'}}>{new Date(r.submitted_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>
                        {role === 'student' ? 'Edit' : 'Review'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? (role === 'student' ? 'Edit Report' : 'Review Report') : 'Submit Weekly Report'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {!editing && (
                  <div className="form-group">
                    <label className="form-label">Internship</label>
                    <select className="form-control" value={form.internship} onChange={e=>setForm({...form,internship:e.target.value})} required>
                      <option value="">Select internship...</option>
                      {myInternships.map(i => <option key={i.id} value={i.id}>{i.title} — {i.company_name}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Week Number</label>
                  <input type="number" className="form-control" min="1" max="52" value={form.week_number}
                    onChange={e=>setForm({...form,week_number:+e.target.value})} required disabled={role !== 'student'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Activities Performed</label>
                  <textarea className="form-control" rows="4" value={form.activities}
                    onChange={e=>setForm({...form,activities:e.target.value})} required disabled={role !== 'student'}
                    placeholder="Describe what you did this week..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Challenges Faced</label>
                  <textarea className="form-control" rows="3" value={form.challenges}
                    onChange={e=>setForm({...form,challenges:e.target.value})} disabled={role !== 'student'}
                    placeholder="Any difficulties encountered..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Achievements</label>
                  <textarea className="form-control" rows="3" value={form.achievements}
                    onChange={e=>setForm({...form,achievements:e.target.value})} disabled={role !== 'student'}
                    placeholder="What you accomplished..." />
                </div>
                {(role === 'supervisor' || role === 'admin') && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Supervisor Comment</label>
                      <textarea className="form-control" rows="3" value={form.supervisor_comment || ''}
                        onChange={e=>setForm({...form,supervisor_comment:e.target.value})}
                        placeholder="Add feedback for the student..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-control" value={form.status || 'submitted'} onChange={e=>setForm({...form,status:e.target.value})}>
                        <option value="submitted">Submitted</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Submit Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
