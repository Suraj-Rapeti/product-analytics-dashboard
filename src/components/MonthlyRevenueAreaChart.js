import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const formatCurrencyTick = (value) => {
  const compact = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);
  return `$${compact}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-card-hover px-3 py-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

function MonthlyRevenueAreaChart({ data = [], subtitle = 'Rolling 12-month revenue trend' }) {
  const { isDark } = useTheme();
  const gridColor = isDark ? '#1E293B' : '#F1F5F9';
  const tickColor = isDark ? '#475569' : '#94A3B8';

  return (
    <div className="bg-white dark:bg-slate-800/80 dark:ring-1 dark:ring-slate-700/50 rounded-xl shadow-card dark:shadow-none px-5 pt-5 pb-4 flex flex-col transition-colors duration-200">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Monthly Revenue</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="monthlyRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            dy={6}
            minTickGap={16}
          />
          <YAxis
            tickFormatter={formatCurrencyTick}
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#06B6D4"
            strokeWidth={2.5}
            fill="url(#monthlyRevenueFill)"
            activeDot={{ r: 5, fill: '#0891B2', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyRevenueAreaChart;
