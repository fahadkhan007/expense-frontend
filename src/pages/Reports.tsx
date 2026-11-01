import { useEffect, useState, type FormEvent } from 'react';
import { Search, TrendingUp, TrendingDown, Activity, Percent, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getReport } from '../api/reports';
import type { Report } from '../types';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

export default function Reports() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const load = async (params?: { start_date?: string; end_date?: string }) => {
    setError(''); setLoading(true);
    try {
      setReport(await getReport(params));
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Failed to load report.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (e: FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) { setError('Select both start and end dates.'); return; }
    load({ start_date: `${startDate}T00:00:00Z`, end_date: `${endDate}T23:59:59Z` });
  };

  const handleClear = () => { setStartDate(''); setEndDate(''); load(); };

  const s = report?.summary;
  const isCustom = report?.period.type === 'custom';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">{isCustom ? `${report!.period.start_date?.slice(0,10)} → ${report!.period.end_date?.slice(0,10)}` : 'All-time financial overview'}</p>
        </div>
      </div>

      {/* Date filter */}
      <form className="filter-bar" onSubmit={handleFilter}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">From</label>
          <input type="date" className="form-input" style={{ width: 160 }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">To</label>
          <input type="date" className="form-input" style={{ width: 160 }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
          <Search size={14} /> Apply filter
        </button>
        {isCustom && (
          <button type="button" className="btn btn-ghost" style={{ alignSelf: 'flex-end' }} onClick={handleClear}>
            <X size={14} /> Clear
          </button>
        )}
      </form>

      {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? <Spinner /> : !report ? null : (
        <>
          {/* Summary */}
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <StatCard label="Total Income" value={fmt(s!.total_credits)} sub={`${s!.credit_count} transactions`} icon={<TrendingUp size={18} color="#27AE60" />} iconBg="var(--green-light)" valueColor="var(--green)" />
            <StatCard label="Total Expenses" value={fmt(s!.total_expenses)} sub={`${s!.expense_count} transactions`} icon={<TrendingDown size={18} color="#E74C3C" />} iconBg="var(--red-light)" valueColor="var(--red)" />
            <StatCard label="Net Cash Flow" value={fmt(s!.net_cash_flow)} sub={s!.net_cash_flow >= 0 ? 'Positive balance' : 'Negative balance'} icon={<Activity size={18} color="#1CC29F" />} iconBg="var(--teal-light)" valueColor={s!.net_cash_flow >= 0 ? 'var(--green)' : 'var(--red)'} />
            <StatCard label="Savings Rate" value={s!.savings_rate != null ? `${s!.savings_rate}%` : 'N/A'} sub="Of income saved" icon={<Percent size={18} color="#F39C12" />} iconBg="var(--amber-light)" />
          </div>

          {/* Monthly bar chart */}
          {report.cash_flow_trend.length > 0 && (
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="chart-title">Monthly Cash Flow</div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={report.cash_flow_trend} barGap={3} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E8F0" />
                  <XAxis dataKey="month" tick={{ fill: '#97A0AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#97A0AF', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E4E8F0', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(v: unknown) => typeof v === 'number' ? [`$${v.toFixed(2)}`, ''] : ['—', '']} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="total_credits"  name="Income"   fill="#27AE60" radius={[4,4,0,0]} />
                  <Bar dataKey="total_expenses" name="Expenses" fill="#E74C3C" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category breakdown */}
          <div className="charts-grid">
            <div className="card">
              <div className="chart-title">Expenses by Category</div>
              {report.expenses_by_category.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}><div className="empty-desc">No expense data</div></div>
              ) : report.expenses_by_category.map((item) => (
                <div key={item.category_id} className="report-bar-row">
                  <span className="report-bar-label">{item.icon && `${item.icon} `}{item.category_name}</span>
                  <div className="report-bar-track">
                    <div className="report-bar-fill" style={{ width: `${item.percentage}%`, background: item.color ?? '#E74C3C' }} />
                  </div>
                  <span className="report-bar-pct">{item.percentage}%</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="chart-title">Income by Category</div>
              {report.credits_by_category.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}><div className="empty-desc">No income data</div></div>
              ) : report.credits_by_category.map((item) => (
                <div key={item.category_id} className="report-bar-row">
                  <span className="report-bar-label">{item.icon && `${item.icon} `}{item.category_name}</span>
                  <div className="report-bar-track">
                    <div className="report-bar-fill" style={{ width: `${item.percentage}%`, background: item.color ?? '#27AE60' }} />
                  </div>
                  <span className="report-bar-pct">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top transactions */}
          {(report.top_expenses.length > 0 || report.top_credits.length > 0) && (
            <div className="charts-grid" style={{ marginTop: 18 }}>
              <div className="card">
                <div className="chart-title">Top Expenses</div>
                {report.top_expenses.map((t) => (
                  <div key={t._id} className="top-txn-row">
                    <div>
                      <div className="fw-600 fs-13">{t.description ?? 'No description'}</div>
                      <div className="top-txn-desc">{new Date(t.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</div>
                    </div>
                    <span className="amount-debit">−{fmt(t.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="chart-title">Top Income</div>
                {report.top_credits.map((t) => (
                  <div key={t._id} className="top-txn-row">
                    <div>
                      <div className="fw-600 fs-13">{t.description ?? 'No description'}</div>
                      <div className="top-txn-desc">{new Date(t.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</div>
                    </div>
                    <span className="amount-credit">+{fmt(t.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
