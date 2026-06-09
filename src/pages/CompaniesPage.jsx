import { useState, useEffect } from 'react';
import { companies as companiesApi } from '../api';

export default function CompaniesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'',address:'',contact_person:'',contact_email:'',contact_phone:'',industry:'' });

  const load = () => companiesApi.list().then(r => setItems(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name:'',address:'',contact_person:'',contact_email:'',contact_phone:'',industry:'' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm(item); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await companiesApi.update(editing.id, form);
    else await companiesApi.create(form);
    setShowModal(false); load();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this company?')) { await companiesApi.delete(id); load(); }
  };

  if (loading) return <div className="loading">Loading companies...</div>;

  return (
    <div>
      <div className="page-header flex-between">
        <div><h1>Partner Companies</h1><p>Manage internship host organizations</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Company</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'16px',marginBottom:'20px'}}>
        {items.map(c => (
          <div key={c.id} className="card" style={{position:'relative'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
              <div style={{fontSize:'2rem'}}>🏢</div>
              <div style={{display:'flex',gap:'6px'}}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Del</button>
              </div>
            </div>
            <h3 style={{fontSize:'1rem',fontWeight:'700',marginBottom:'4px'}}>{c.name}</h3>
            <span className="badge badge-active" style={{marginBottom:'12px',display:'inline-block'}}>{c.industry}</span>
            <div style={{fontSize:'0.85rem',color:'#64748b',display:'flex',flexDirection:'column',gap:'4px'}}>
              <div>📍 {c.address}</div>
              <div>👤 {c.contact_person}</div>
              <div>📧 {c.contact_email}</div>
              <div>📞 {c.contact_phone}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="empty" style={{gridColumn:'1/-1'}}>No companies yet. Add your first partner company!</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Company' : 'Add Company'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input className="form-control" value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} placeholder="e.g. Banking & Finance" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input className="form-control" value={form.contact_person} onChange={e=>setForm({...form,contact_person:e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.contact_email} onChange={e=>setForm({...form,contact_email:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows="2" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Company'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
