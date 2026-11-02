import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, Pencil, Tag } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import type { Category } from '../types';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const ICONS = ['🍔', '🚗', '🏠', '💊', '🎮', '✈️', '📚', '🛍️', '💡', '💰', '💼', '🎁', '☕', '🏋️', '🍕', '🎵', '⚡', '🌐'];
const COLORS = ['#1CC29F', '#27AE60', '#E74C3C', '#F39C12', '#3498DB', '#9B59B6', '#E91E63', '#00BCD4', '#FF5722', '#607D8B'];

interface FormBodyProps {
  error: string;
  name: string;
  setName: (v: string) => void;
  type: 'debit' | 'credit' | '';
  setType: (v: 'debit' | 'credit' | '') => void;
  icon: string;
  setIcon: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
}

function FormBody({ error, name, setName, type, setType, icon, setIcon, color, setColor }: FormBodyProps) {
  return (
    <>
      {error && <div className="alert-error">{error}</div>}
      <div className="form-group">
        <label className="form-label">Name</label>
        <input type="text" className="form-input" placeholder="e.g. Food & Dining" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} />
      </div>
      <div className="form-group">
        <label className="form-label">Type</label>
        <select className="form-select" value={type} onChange={(e) => setType(e.target.value as 'debit' | 'credit' | '')}>
          <option value="">Any (both debit &amp; credit)</option>
          <option value="debit">Expense (Debit only)</option>
          <option value="credit">Income (Credit only)</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Icon</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ICONS.map((i) => (
            <button key={i} type="button" onClick={() => setIcon(i)}
              style={{ fontSize: 20, background: icon === i ? 'var(--teal-light)' : 'var(--bg)', border: `1.5px solid ${icon === i ? 'var(--teal)' : 'var(--border)'}`, borderRadius: 8, padding: '4px 7px', cursor: 'pointer', transition: 'all 0.1s' }}>
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)}
              style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: `3px solid ${color === c ? 'var(--text)' : 'transparent'}`, cursor: 'pointer', transition: 'border 0.1s' }} />
          ))}
        </div>
      </div>
    </>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [type, setType] = useState<'debit' | 'credit' | ''>('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const load = () => getCategories().then(setCategories).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setName(''); setType(''); setIcon(ICONS[0]); setColor(COLORS[0]); setError(''); setShowCreate(true); };

  const openEdit = (c: Category) => {
    setName(c.name); setType((c.type ?? '') as 'debit' | 'credit' | '');
    setIcon(c.icon ?? ICONS[0]); setColor(c.color ?? COLORS[0]); setError('');
    setEditCat(c);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createCategory({ name, type: type || null, icon, color });
      setShowCreate(false); load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Failed to create.');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editCat) return;
    setSaving(true); setError('');
    try {
      await updateCategory(editCat._id, { name, type: type || null, icon, color });
      setEditCat(null); load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Failed to update.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await deleteCategory(id); load();
  };

  const formBodyProps = { error, name, setName, type, setType, icon, setIcon, color, setColor };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">{categories.length} categories · Organise your finances</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Category</button>
      </div>

      {loading ? <Spinner /> : categories.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: '64px 24px', boxShadow: 'var(--shadow)' }}>
          <Tag size={36} color="var(--text-3)" style={{ margin: '0 auto 10px' }} />
          <div className="empty-title">No categories yet</div>
          <div className="empty-desc">Create categories to organise your transactions</div>
        </div>
      ) : (
        <div className="category-grid">
          {categories.map((c) => (
            <div key={c._id} className="category-card">
              <div className="cat-icon" style={{ background: (c.color ?? '#1CC29F') + '22' }}>
                {c.icon ? c.icon : <Tag size={18} color={c.color ?? '#1CC29F'} />}
              </div>
              <div className="cat-info">
                <div className="cat-name">{c.name}</div>
                <span className={`badge badge-${c.type ?? 'neutral'}`} style={{ marginTop: 4 }}>{c.type ?? 'Any'}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)}><Pencil size={12} /></button>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(c._id)}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Add Category" onClose={() => setShowCreate(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Create'}</button></>}>
          <form onSubmit={handleCreate}><FormBody {...formBodyProps} /></form>
        </Modal>
      )}

      {editCat && (
        <Modal title={`Edit — ${editCat.name}`} onClose={() => setEditCat(null)}
          footer={<><button className="btn btn-ghost" onClick={() => setEditCat(null)}>Cancel</button><button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
          <form onSubmit={handleUpdate}><FormBody {...formBodyProps} /></form>
        </Modal>
      )}
    </div>
  );
}
