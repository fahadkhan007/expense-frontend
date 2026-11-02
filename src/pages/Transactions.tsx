import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, Pencil, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactions';
import { getCategories } from '../api/categories';
import type { Transaction, Category } from '../types';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const PAGE_SIZE = 20;

interface FormBodyProps {
  isEdit: boolean;
  error: string;
  type: 'debit' | 'credit';
  setType: (t: 'debit' | 'credit') => void;
  amount: string;
  setAmount: (v: string) => void;
  catId: string;
  setCatId: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
  categories: Category[];
  filteredCats: Category[];
}

function FormBody({ isEdit, error, type, setType, amount, setAmount, catId, setCatId, desc, setDesc, categories, filteredCats }: FormBodyProps) {
  return (
    <>
      {error && <div className="alert-error">{error}</div>}
      {!isEdit && (
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={type} onChange={(e) => { setType(e.target.value as 'debit' | 'credit'); setCatId(''); }}>
            <option value="debit">Expense (Debit)</option>
            <option value="credit">Income (Credit)</option>
          </select>
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Amount ($)</label>
        <input type="number" className="form-input" placeholder="0.00" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <select className="form-select" value={catId} onChange={(e) => setCatId(e.target.value)}>
          <option value="">Select category…</option>
          {(isEdit ? categories : filteredCats).map((c) => (
            <option key={c._id} value={c._id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Description (optional)</label>
        <input type="text" className="form-input" placeholder="What was this for?" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={300} />
      </div>
    </>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // form
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [amount, setAmount] = useState('');
  const [catId, setCatId] = useState('');
  const [desc, setDesc] = useState('');

  const load = (p: number) => {
    setLoading(true);
    getTransactions(p).then(setTransactions).finally(() => setLoading(false));
  };

  useEffect(() => { getCategories().then(setCategories); load(1); }, []);

  const filteredCats = categories.filter((c) => c.type === type || c.type === null);

  const openCreate = () => {
    setType('debit'); setAmount(''); setCatId(''); setDesc(''); setError('');
    setShowCreate(true);
  };

  const openEdit = (t: Transaction) => {
    setAmount(String(t.amount)); setCatId(t.category_id);
    setDesc(t.description ?? ''); setError('');
    setEditTxn(t);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!catId) { setError('Please select a category.'); return; }
    setSaving(true); setError('');
    try {
      await createTransaction({ type, amount: parseFloat(amount), category_id: catId, description: desc || undefined });
      setShowCreate(false); load(page);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Failed to create.');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editTxn) return;
    setSaving(true); setError('');
    try {
      await updateTransaction(editTxn._id, {
        amount: parseFloat(amount),
        category_id: catId || undefined,
        description: desc || undefined,
      });
      setEditTxn(null); load(page);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Failed to update.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    await deleteTransaction(id); load(page);
  };

  const handlePage = (p: number) => { setPage(p); load(p); };

  const catName = (id: string) => {
    const c = categories.find((c) => c._id === id);
    return c ? `${c.icon ?? ''} ${c.name}`.trim() : '—';
  };

  const formBodyProps = { error, type, setType, amount, setAmount, catId, setCatId, desc, setDesc, categories, filteredCats };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">All your income and expenses</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Transaction
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? <Spinner /> : transactions.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={36} color="var(--text-3)" style={{ margin: '0 auto 10px' }} />
            <div className="empty-title">No transactions yet</div>
            <div className="empty-desc">Click "Add Transaction" to get started</div>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Type</th><th>Category</th><th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th><th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td className="text-muted fs-12">{new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                    <td className="fw-600 fs-13">{catName(t.category_id)}</td>
                    <td className="text-2">{t.description ?? <span className="text-muted">—</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`amount-${t.type}`}>{t.type === 'debit' ? '−' : '+'}${t.amount.toFixed(2)}</span>
                    </td>
                    <td>
                      <div className="td-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => openEdit(t)}><Pencil size={13} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => handleDelete(t._id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <span className="pagination-info">Page {page} · {transactions.length} items</span>
              <div className="pagination-controls">
                <button className="btn btn-ghost btn-sm" onClick={() => handlePage(page - 1)} disabled={page === 1}><ChevronLeft size={14} /></button>
                <span className="page-num">{page}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => handlePage(page + 1)} disabled={transactions.length < PAGE_SIZE}><ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {showCreate && (
        <Modal title="Add Transaction" onClose={() => setShowCreate(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Add'}</button></>}>
          <form onSubmit={handleCreate}><FormBody isEdit={false} {...formBodyProps} /></form>
        </Modal>
      )}

      {editTxn && (
        <Modal title="Edit Transaction" onClose={() => setEditTxn(null)}
          footer={<><button className="btn btn-ghost" onClick={() => setEditTxn(null)}>Cancel</button><button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
          <form onSubmit={handleUpdate}><FormBody isEdit={true} {...formBodyProps} /></form>
        </Modal>
      )}
    </div>
  );
}
