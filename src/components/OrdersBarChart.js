import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-card-hover px-3 py-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
        {payload[0].value} orders
      </p>
    </div>
  );
};

function OrdersBarChart({ data = [] }) {
  const { isDark } = useTheme();
  const max        = data.length > 0 ? Math.max(...data.map((d) => d.orders || 0)) : 0;
  const gridColor  = isDark ? '#1E293B' : '#F1F5F9';
  const tickColor  = isDark ? '#475569' : '#94A3B8';
  const cursorFill = isDark ? '#1E293B' : '#F8FAFC';
  const barPeak    = isDark ? '#818CF8' : '#6366F1';
  const barNormal  = isDark ? '#312E81' : '#C7D2FE';

  return (
    <div className="bg-white dark:bg-slate-800/80 dark:ring-1 dark:ring-slate-700/50 rounded-xl shadow-card dark:shadow-none px-5 pt-5 pb-4 flex flex-col transition-colors duration-200">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Orders Per Day</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Last 7 days</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
          <Bar dataKey="orders" radius={[5, 5, 0, 0]} name="Orders">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.orders === max ? barPeak : barNormal}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OrdersBarChart;
