import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTransactions, createTransaction, deleteTransaction } from '../api/transactions';
import { getCategories } from '../api/categories';
import type { Transaction, Category } from '../types';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const PAGE_SIZE = 20;

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [amount, setAmount] = useState('');
  const [catId, setCatId] = useState('');
  const [desc, setDesc] = useState('');

  const load = (p: number) => {
    setLoading(true);
    getTransactions(p).then(setTransactions).finally(() => setLoading(false));
  };

  useEffect(() => {
    getCategories().then(setCategories);
    load(page);
  }, []);

  const filteredCats = categories.filter((c) => c.type === type || c.type === null);

  const openModal = () => {
    setType('debit'); setAmount(''); setCatId(''); setDesc(''); setError('');
    setShowModal(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!catId) { setError('Please select a category.'); return; }
    setSaving(true);
    try {
      await createTransaction({ type, amount: parseFloat(amount), category_id: catId, description: desc || undefined });
      setShowModal(false);
      load(page);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(msg ?? 'Failed to create transaction.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
    load(page);
  };

  const handlePage = (p: number) => { setPage(p); load(p); };

  const catName = (id: string) => categories.find((c) => c._id === id)?.name ?? id.slice(0, 8);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Manage your income and expenses</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? <Spinner /> : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <div className="empty-title">No transactions yet</div>
            <div className="empty-desc">Click "Add Transaction" to get started</div>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td className="text-muted fs-13">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                    <td className="text-secondary">{catName(t.category_id)}</td>
                    <td className="text-muted">{t.description ?? '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`amount-${t.type}`}>
                        {t.type === 'debit' ? '−' : '+'}${t.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(t._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <span className="pagination-info">Page {page}</span>
              <div className="pagination-controls">
                <button className="btn btn-ghost btn-sm" onClick={() => handlePage(page - 1)} disabled={page === 1}>
                  <ChevronLeft size={15} />
                </button>
                <span className="page-num">{page}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => handlePage(page + 1)} disabled={transactions.length < PAGE_SIZE}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <Modal
          title="Add Transaction"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Saving…' : 'Add Transaction'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreate}>
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={type} onChange={(e) => { setType(e.target.value as 'debit' | 'credit'); setCatId(''); }}>
                <option value="debit">Expense (Debit)</option>
                <option value="credit">Income (Credit)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input type="number" className="form-input" placeholder="0.00" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={catId} onChange={(e) => setCatId(e.target.value)} required>
                <option value="">Select category…</option>
                {filteredCats.map((c) => (
                  <option key={c._id} value={c._id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description (optional)</label>
              <input type="text" className="form-input" placeholder="What was this for?" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={300} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
