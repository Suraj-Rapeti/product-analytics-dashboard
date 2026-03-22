import React from 'react';
import { Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const iconMap = {
  Users,
  ShoppingCart,
  DollarSign,
};

const colorMap = {
  blue: {
    bg:   'bg-brand-50 dark:bg-brand-500/10',
    icon: 'text-brand-500 dark:text-brand-400',
    ring: 'ring-brand-100 dark:ring-brand-500/20',
  },
  indigo: {
    bg:   'bg-indigo-50 dark:bg-indigo-500/10',
    icon: 'text-indigo-500 dark:text-indigo-400',
    ring: 'ring-indigo-100 dark:ring-indigo-500/20',
  },
  emerald: {
    bg:   'bg-emerald-50 dark:bg-emerald-500/10',
    icon: 'text-emerald-500 dark:text-emerald-400',
    ring: 'ring-emerald-100 dark:ring-emerald-500/20',
  },
};

function MetricCard({ title, value, change, trend, icon, color }) {
  const Icon = iconMap[icon] || DollarSign;
  const colors = colorMap[color] || colorMap.blue;
  const isUp = trend === 'up';

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl shadow-card dark:shadow-none dark:ring-1 dark:ring-slate-700/50 px-5 py-5 flex flex-col gap-3 hover:shadow-card-hover dark:hover:ring-slate-600/60 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ring-1 ${colors.bg} ${colors.ring}`}
        >
          <Icon size={18} className={colors.icon} />
        </div>

        <span
          className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isUp
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'
          }`}
        >
          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </span>
      </div>

      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
          {value}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {title}
        </p>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-600">vs last month</p>
    </div>
  );
}

export default MetricCard;
