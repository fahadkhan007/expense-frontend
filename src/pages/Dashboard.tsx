import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, Percent, Plus, ArrowRight, LineChart, Tags, CreditCard, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../dashboard.css';
import { getReport } from '../api/reports';
import { getTransactions } from '../api/transactions';
import type { Report, Transaction } from '../types';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtFull = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

export default function Dashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all-time report + current month report
    Promise.all([getReport(), getTransactions(1)])
      .then(([r, t]) => { setReport(r); setRecent(t.slice(0, 6)); })
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <Spinner />;

  const s = report?.summary;
  const trend = report?.cash_flow_trend ?? [];

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name.split(' ')[0]}</h1>
          <p className="page-subtitle">All-time financial overview</p>
        </div>
      </div>

      {/* Two-column dashboard layout */}
      <div className="dashboard-layout">

        {/* ── LEFT / MAIN ─────────────────────────────────── */}
        <div className="dashboard-main">

          {/* Stat cards — 2 per row to keep them compact alongside right panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <StatCard
              label="Total Income"
              value={fmt(s?.total_credits ?? 0)}
              sub={`${s?.credit_count ?? 0} transactions`}
              icon={<TrendingUp size={17} color="#27AE60" />}
              iconBg="var(--green-light)"
              valueColor="var(--green)"
            />
            <StatCard
              label="Total Expenses"
              value={fmt(s?.total_expenses ?? 0)}
              sub={`${s?.expense_count ?? 0} transactions`}
              icon={<TrendingDown size={17} color="#E74C3C" />}
              iconBg="var(--red-light)"
              valueColor="var(--red)"
            />
            <StatCard
              label="Net Cash Flow"
              value={fmt(s?.net_cash_flow ?? 0)}
              sub={s && s.net_cash_flow >= 0 ? 'Positive' : 'Negative'}
              icon={<Activity size={17} color="#1CC29F" />}
              iconBg="var(--teal-light)"
              valueColor={s && s.net_cash_flow >= 0 ? 'var(--green)' : 'var(--red)'}
            />
            <StatCard
              label="Savings Rate"
              value={s?.savings_rate != null ? `${s.savings_rate}%` : 'N/A'}
              sub="Of income saved"
              icon={<Percent size={17} color="#F39C12" />}
              iconBg="var(--amber-light)"
            />
          </div>

          {/* Cash flow chart */}
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="chart-title">Cash Flow Trend</div>
            {trend.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 0' }}>
                <LineChart size={34} color="var(--text-3)" style={{ margin: '0 auto 10px' }} />
                <div className="empty-desc">Add transactions to see your trend</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#27AE60" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E74C3C" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#E74C3C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E8F0" />
                  <XAxis dataKey="month" tick={{ fill: '#97A0AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#97A0AF', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E4E8F0', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(v: unknown) => typeof v === 'number' ? [`$${v.toFixed(2)}`, ''] : ['—', '']}
                  />
                  <Area type="monotone" dataKey="total_credits"  stroke="#27AE60" fill="url(#gInc)" strokeWidth={2} name="Income" />
                  <Area type="monotone" dataKey="total_expenses" stroke="#E74C3C" fill="url(#gExp)" strokeWidth={2} name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent transactions */}
          <div className="table-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>Recent Transactions</span>
              <Link to="/transactions" className="btn btn-teal-outline btn-sm">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 24px' }}>
                <CreditCard size={32} color="var(--text-3)" style={{ margin: '0 auto 10px' }} />
                <div className="empty-title">No transactions yet</div>
                <div className="empty-desc">Use the button above to add your first one</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Description</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t._id}>
                      <td className="text-muted fs-12">{new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                      <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                      <td className="text-2">{t.description ?? <span className="text-muted">—</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`amount-${t.type}`}>{t.type === 'debit' ? '−' : '+'}${t.amount.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────── */}
        <div className="dashboard-right">

          {/* Quick Add */}
          <div className="right-panel">
            <div className="right-panel-header">Quick Actions</div>
            <div className="right-panel-body">
              <Link to="/transactions" className="quick-add-btn">
                <Plus size={15} /> Add Transaction
              </Link>
              <Link to="/categories" className="quick-add-btn" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', marginBottom: 0 }}>
                <Tags size={14} /> Manage Categories
              </Link>
            </div>
          </div>

          {/* Summary stats */}
          <div className="right-panel">
            <div className="right-panel-header">Summary</div>
            <div className="right-panel-body">
              <div className="right-panel-row">
                <span className="right-panel-row-label">Total Transactions</span>
                <span className="right-panel-row-val">{s?.transaction_count ?? 0}</span>
              </div>
              <div className="right-panel-row">
                <span className="right-panel-row-label">Avg. Expense</span>
                <span className="right-panel-row-val text-red">{s?.average_expense ? fmtFull(s.average_expense) : '—'}</span>
              </div>
              <div className="right-panel-row">
                <span className="right-panel-row-label">Avg. Income</span>
                <span className="right-panel-row-val text-green">{s?.average_credit ? fmtFull(s.average_credit) : '—'}</span>
              </div>
              <div className="right-panel-row">
                <span className="right-panel-row-label">Savings Rate</span>
                <span className="right-panel-row-val">{s?.savings_rate != null ? `${s.savings_rate}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Top expense categories */}
          {(report?.expenses_by_category.length ?? 0) > 0 && (
            <div className="right-panel">
              <div className="right-panel-header">Top Expenses</div>
              <div className="right-panel-body">
                {report!.expenses_by_category.slice(0, 4).map((item) => (
                  <div key={item.category_id} className="right-panel-row">
                    <span className="right-panel-row-label" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{item.icon} {item.category_name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.percentage}%</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${item.percentage}%`, background: item.color ?? 'var(--red)', borderRadius: 3 }} />
                      </div>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigate to reports */}
          <Link to="/reports" className="btn btn-ghost" style={{ justifyContent: 'center', fontSize: 13 }}>
            <BarChart2 size={14} /> View full report
          </Link>
        </div>
      </div>
    </div>
  );
}

