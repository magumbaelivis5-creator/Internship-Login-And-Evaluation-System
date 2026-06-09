import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { internships as internshipApi, companies as companiesApi, users } from '../api';

export default function InternshipsPage() {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', company: '', supervisor: '', start_date: '', end_date: '', status: 'pending' });

  const load = () => {
    Promise.all([
      internshipApi.list(),
      companiesApi.list(),
      users.list('supervisor'),
    ]).then(([i, c, u]) => {
      setItems(i.data); setCompanies(c.data); setSupervisors(u.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', company: '', supervisor: '', start_date: '', end_date: '', status: 'pending' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ title: item.title, description: item.description, company: item.company, supervisor: item.supervisor || '', start_date: item.start_date, end_date: item.end_date, status: item.status }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert text values to number IDs so Django understands them
    const payload = {
      ...form,
      company: form.company ? Number(form.company) : null,
    };

    if (form.supervisor) {
      payload.supervisor = Number(form.supervisor);
    } else {
      delete payload.supervisor;
    }

    try {
      if (editing) {
        await internshipApi.update(editing.id, payload);
      } else {
        await internshipApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch (error) {
      console.error("Form submission failed:", error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this internship?')) { await internshipApi.delete(id); load(); }
  };

  const statusBadge = (s) => <span className={`badge badge-${s}`}>{s}</span>;

  if (loading) return <div className="loading">Loading internships...</div>;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Internships</h1>
          <p>Manage and track all internship placements</p>
        </div>
        {(role === 'student' || role === 'admin') && (
          <button className="btn btn-primary" onClick={openCreate}>+ Add Internship</button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          {items.length === 0 ? (
            <div className="empty">No internships found. {role === 'student' && 'Apply for your first internship!'}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th><th>Student</th><th>Company</th><th>Supervisor</th>
                  <th>Duration</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.student_name}</td>
                    <td>{item.company_name}</td>
                    <td>{item.supervisor_name || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.start_date} → {item.end_date}</td>
                    <td>{statusBadge(item.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Edit</button>
                        {role === 'admin' && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Del</button>}
                      </div>
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
              <h3>{editing ? 'Edit Internship' : 'New Internship Application'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Software Developer Intern" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the internship role..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <select className="form-control" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required>
                    <option value="">Select company...</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Supervisor (optional)</label>
                  <select className="form-control" value={form.supervisor} onChange={e => setForm({ ...form, supervisor: e.target.value })}>
                    <option value="">Select supervisor...</option>
                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
                  </div>
                </div>
                {(role === 'supervisor' || role === 'admin') && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {['pending', 'approved', 'active', 'completed', 'rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Submit Application'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
