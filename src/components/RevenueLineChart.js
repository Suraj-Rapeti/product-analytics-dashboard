import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const formatChartDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-card-hover px-3 py-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{formatChartDate(label)}</p>
      <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

function RevenueLineChart({ data = [] }) {
  const { isDark } = useTheme();
  const gridColor  = isDark ? '#1E293B' : '#F1F5F9';
  const tickColor  = isDark ? '#475569' : '#94A3B8';
  const xKey = data.length > 0 && Object.prototype.hasOwnProperty.call(data[0], 'date') ? 'date' : 'month';

  return (
    <div className="bg-white dark:bg-slate-800/80 dark:ring-1 dark:ring-slate-700/50 rounded-xl shadow-card dark:shadow-none px-5 pt-5 pb-4 flex flex-col transition-colors duration-200">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Revenue Over Time</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Monthly revenue — FY 2025</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={formatChartDate}
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tickFormatter={(v) => `$${v / 1000}k`}
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#2563EB', strokeWidth: 0 }}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueLineChart;
