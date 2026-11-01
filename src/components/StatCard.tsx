import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  iconBg: string;
  valueColor?: string;
}

export default function StatCard({ label, value, sub, icon, iconBg, valueColor }: Props) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ color: valueColor }}>{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
