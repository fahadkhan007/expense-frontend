import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import type { Category } from '../types';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const ICONS = ['🍔', '🚗', '🏠', '💊', '🎮', '✈️', '📚', '🛍️', '💡', '💰', '💼', '🎁', '☕', '🏋️', '🍕'];
const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [type, setType] = useState<'debit' | 'credit' | ''>('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const load = () => getCategories().then(setCategories).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openModal = () => {
    setName(''); setType(''); setIcon(ICONS[0]); setColor(COLORS[0]); setError('');
    setShowModal(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createCategory({ name, type: type || null, icon, color });
      setShowModal(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(msg ?? 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await deleteCategory(id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organise your transactions</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? <Spinner /> : categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <div className="empty-title">No categories yet</div>
          <div className="empty-desc">Create categories to organise your transactions</div>
        </div>
      ) : (
        <div className="category-grid">
          {categories.map((c) => (
            <div key={c._id} className="category-card">
              <div className="cat-icon" style={{ background: (c.color ?? '#6366f1') + '22' }}>
                {c.icon ?? '📦'}
              </div>
              <div className="cat-info">
                <div className="cat-name">{c.name}</div>
                <span className={`badge badge-${c.type ?? 'neutral'}`} style={{ marginTop: 4 }}>
                  {c.type ?? 'Any'}
                </span>
              </div>
              <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(c._id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="Add Category"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Saving…' : 'Create'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreate}>
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" placeholder="e.g. Food & Dining" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value as 'debit' | 'credit' | '')}>
                <option value="">Any (debit & credit)</option>
                <option value="debit">Expense (Debit only)</option>
                <option value="credit">Income (Credit only)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ICONS.map((i) => (
                  <button key={i} type="button" onClick={() => setIcon(i)}
                    style={{ fontSize: 22, background: icon === i ? 'var(--accent-glow)' : 'var(--surface)', border: `1px solid ${icon === i ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '4px 8px', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: color === c ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.15s', outline: color === c ? `2px solid ${c}` : 'none' }} />
                ))}
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
