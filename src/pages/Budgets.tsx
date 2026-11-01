import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, Pencil, Wallet } from 'lucide-react';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgets';
import type { Budget } from '../types';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [month, setMonth] = useState('');
  const [limit, setLimit] = useState('');

  const load = () => getBudgets().then(setBudgets).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setMonth(''); setLimit(''); setError(''); setShowCreate(true); };
  const openEdit = (b: Budget) => { setLimit(String(b.limit)); setError(''); setEditBudget(b); };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createBudget({ month, limit: parseFloat(limit) });
      setShowCreate(false); load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Failed to create.');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editBudget) return;
    setSaving(true); setError('');
    try {
      await updateBudget(editBudget._id, { limit: parseFloat(limit) });
      setEditBudget(null); load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Failed to update.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    await deleteBudget(id); load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set monthly spending limits to stay on track</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Set Budget</button>
      </div>

      <div className="table-wrapper">
        {loading ? <Spinner /> : budgets.length === 0 ? (
          <div className="empty-state">
            <Wallet size={36} color="var(--text-3)" style={{ margin: '0 auto 10px' }} />
            <div className="empty-title">No budgets set</div>
            <div className="empty-desc">Set a monthly limit to keep spending in check</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Month</th><th style={{ textAlign: 'right' }}>Monthly Limit</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {budgets.sort((a, b) => b.month.localeCompare(a.month)).map((b) => (
                <tr key={b._id}>
                  <td>
                    <span className="fw-600">{new Date(b.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <span className="text-muted fs-12" style={{ marginLeft: 8 }}>{b.month}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="amount-credit fw-700" style={{ fontSize: 15 }}>${b.limit.toFixed(2)}</span>
                  </td>
                  <td>
                    <div className="td-actions" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(b)}><Pencil size={13} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(b._id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <Modal title="Set Monthly Budget" onClose={() => setShowCreate(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Create'}</button></>}>
          <form onSubmit={handleCreate}>
            {error && <div className="alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Month</label>
              <input type="month" className="form-input" value={month} onChange={(e) => setMonth(e.target.value.slice(0, 7))} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Spending Limit ($)</label>
              <input type="number" className="form-input" placeholder="1000.00" min="0.01" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} required />
            </div>
          </form>
        </Modal>
      )}

      {editBudget && (
        <Modal title={`Edit Budget — ${editBudget.month}`} onClose={() => setEditBudget(null)}
          footer={<><button className="btn btn-ghost" onClick={() => setEditBudget(null)}>Cancel</button><button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving…' : 'Update'}</button></>}>
          <form onSubmit={handleUpdate}>
            {error && <div className="alert-error">{error}</div>}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Limit ($)</label>
              <input type="number" className="form-input" placeholder="1000.00" min="0.01" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} required />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
