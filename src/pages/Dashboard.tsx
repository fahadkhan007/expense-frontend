import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Percent } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getReport } from '../api/reports';
import { getTransactions } from '../api/transactions';
import type { Report, Transaction } from '../types';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Income"
          value={fmt(s?.total_credits ?? 0)}
          sub={`${s?.credit_count ?? 0} transactions`}
          icon={<TrendingUp size={18} color="#10b981" />}
          iconBg="rgba(16,185,129,0.12)"
          valueColor="var(--success)"
        />
        <StatCard
          label="Total Expenses"
          value={fmt(s?.total_expenses ?? 0)}
          sub={`${s?.expense_count ?? 0} transactions`}
          icon={<TrendingDown size={18} color="#f43f5e" />}
          iconBg="rgba(244,63,94,0.12)"
          valueColor="var(--danger)"
        />
        <StatCard
          label="Net Cash Flow"
          value={fmt(s?.net_cash_flow ?? 0)}
          sub={s && s.net_cash_flow >= 0 ? 'Positive balance' : 'Negative balance'}
          icon={<Activity size={18} color="#6366f1" />}
          iconBg="rgba(99,102,241,0.12)"
          valueColor={s && s.net_cash_flow >= 0 ? 'var(--success)' : 'var(--danger)'}
        />
        <StatCard
          label="Savings Rate"
          value={s?.savings_rate != null ? `${s.savings_rate}%` : 'N/A'}
          sub="Of total income saved"
          icon={<Percent size={18} color="#f59e0b" />}
          iconBg="rgba(245,158,11,0.12)"
        />
      </div>

      {/* Charts + Recent */}
      <div className="charts-grid">
        {/* Cash flow area chart */}
        <div className="card">
          <div className="chart-title">Cash Flow Trend</div>
          {trend.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">📈</div>
              <div className="empty-desc">No trend data yet</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c35" />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#12121f', border: '1px solid #1c1c35', borderRadius: 8, fontSize: 13 }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, '']}
                />
                <Area type="monotone" dataKey="total_credits" stroke="#10b981" fill="url(#gIncome)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="total_expenses" stroke="#f43f5e" fill="url(#gExpense)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top expense categories */}
        <div className="card">
          <div className="chart-title">Top Expense Categories</div>
          {(report?.expenses_by_category ?? []).length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">🏷️</div>
              <div className="empty-desc">No expense data yet</div>
            </div>
          ) : (
            <div>
              {report!.expenses_by_category.slice(0, 5).map((item) => (
                <div key={item.category_id} className="report-bar-row">
                  <span className="report-bar-label">
                    {item.icon && `${item.icon} `}{item.category_name}
                  </span>
                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill"
                      style={{ width: `${item.percentage}%`, background: item.color ?? '#6366f1' }}
                    />
                  </div>
                  <span className="report-bar-pct">{item.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="chart-title" style={{ margin: 0 }}>Recent Transactions</span>
          <a href="/transactions" className="btn btn-ghost btn-sm">View all</a>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <div className="empty-icon">💳</div>
            <div className="empty-title">No transactions yet</div>
            <div className="empty-desc">Add your first transaction to get started</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t._id}>
                  <td className="text-muted fs-13">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                  <td className="text-secondary">{t.description ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`amount-${t.type}`}>
                      {t.type === 'debit' ? '−' : '+'}${t.amount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
