import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { evaluations as evalApi, internships as internshipsApi } from '../api';

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="score-bar-label"><span>{label}</span><span>{value}/100</span></div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function EvaluationsPage() {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ internship: '', technical_skills: 0, communication: 0, teamwork: 0, punctuality: 0, initiative: 0, comments: '' });

  const load = () => {
    Promise.all([evalApi.list(), internshipsApi.list()])
      .then(([e, i]) => { setItems(e.data); setInternships(i.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ internship: '', technical_skills: 0, communication: 0, teamwork: 0, punctuality: 0, initiative: 0, comments: '' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ internship: item.internship, technical_skills: item.technical_skills, communication: item.communication, teamwork: item.teamwork, punctuality: item.punctuality, initiative: item.initiative, comments: item.comments }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert the internship string ID into a pure integer number so Django accepts it
    const payload = {
      ...form,
      internship: Number(form.internship)
    };

    try {
      if (editing) {
        await evalApi.update(editing.id, payload);
      } else {
        await evalApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch (error) {
      console.error("Evaluation submission failed:", error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this evaluation?')) { await evalApi.delete(id); load(); }
  };

  const ScoreInput = ({ label, field }) => (
    <div className="form-group">
      <label className="form-label">{label}: <strong>{form[field]}</strong>/100</label>
      <input type="range" min="0" max="100" value={form[field]}
        onChange={e => setForm({ ...form, [field]: +e.target.value })}
        style={{ width: '100%', accentColor: '#1e3a8a' }} />
    </div>
  );

  if (loading) return <div className="loading">Loading evaluations...</div>;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Evaluations</h1>
          <p>{role === 'student' ? 'Your performance evaluations' : 'Evaluate intern performance'}</p>
        </div>
        {(role === 'supervisor' || role === 'admin') && (
          <button className="btn btn-primary" onClick={openCreate}>+ New Evaluation</button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          {items.length === 0 ? (
            <div className="empty">No evaluations found.</div>
          ) : (
            <table>
              <thead>
                <tr><th>Student</th><th>Technical</th><th>Communication</th><th>Teamwork</th><th>Punctuality</th><th>Initiative</th><th>Overall</th><th>Grade</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map(ev => (
                  <tr key={ev.id}>
                    <td><strong>{ev.student_name}</strong></td>
                    <td>{ev.technical_skills}</td>
                    <td>{ev.communication}</td>
                    <td>{ev.teamwork}</td>
                    <td>{ev.punctuality}</td>
                    <td>{ev.initiative}</td>
                    <td><strong>{ev.overall_score?.toFixed(1)}</strong></td>
                    <td><span className={`badge badge-${ev.grade}`}>{ev.grade}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setShowDetail(ev)}>View</button>
                        {(role === 'supervisor' || role === 'admin') && (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(ev)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id)}>Del</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDetail(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Evaluation Detail — {showDetail.student_name}</h3>
              <button className="modal-close" onClick={() => setShowDetail(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div className={`grade-circle grade-${showDetail.grade}`}>{showDetail.grade}</div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{showDetail.overall_score?.toFixed(1)}/100</div>
                  <div style={{ color: '#64748b' }}>Overall Score</div>
                </div>
              </div>
              <ScoreBar label="Technical Skills" value={showDetail.technical_skills} />
              <ScoreBar label="Communication" value={showDetail.communication} />
              <ScoreBar label="Teamwork" value={showDetail.teamwork} />
              <ScoreBar label="Punctuality" value={showDetail.punctuality} />
              <ScoreBar label="Initiative" value={showDetail.initiative} />
              {showDetail.comments && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <strong>Comments:</strong>
                  <p style={{ marginTop: '6px', color: '#374151' }}>{showDetail.comments}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Evaluation' : 'New Evaluation'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {!editing && (
                  <div className="form-group">
                    <label className="form-label">Internship / Student</label>
                    <select className="form-control" value={form.internship} onChange={e => setForm({ ...form, internship: e.target.value })} required>
                      <option value="">Select internship...</option>
                      {internships.map(i => <option key={i.id} value={i.id}>{i.student_name} — {i.title}</option>)}
                    </select>
                  </div>
                )}
                <ScoreInput label="Technical Skills" field="technical_skills" />
                <ScoreInput label="Communication" field="communication" />
                <ScoreInput label="Teamwork" field="teamwork" />
                <ScoreInput label="Punctuality" field="punctuality" />
                <ScoreInput label="Initiative" field="initiative" />
                <div style={{ background: '#f0f4f8', padding: '10px', borderRadius: '6px', textAlign: 'center', marginBottom: '12px' }}>
                  Estimated Overall: <strong>{((form.technical_skills + form.communication + form.teamwork + form.punctuality + form.initiative) / 5).toFixed(1)}/100</strong>
                </div>
                <div className="form-group">
                  <label className="form-label">Comments</label>
                  <textarea className="form-control" rows="3" value={form.comments}
                    onChange={e => setForm({ ...form, comments: e.target.value })} placeholder="Provide feedback for the student..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Submit Evaluation'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
