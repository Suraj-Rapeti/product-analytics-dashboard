import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from 'recharts';

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-card-hover px-3 py-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">{d.name}</p>
      <p className="text-sm font-bold" style={{ color: d.payload.color }}>
        {d.value.toLocaleString()}
      </p>
    </div>
  );
};

function EventPieChart({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const total = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) : 0;

  return (
    <div className="bg-white dark:bg-slate-800/80 dark:ring-1 dark:ring-slate-700/50 rounded-xl shadow-card dark:shadow-none px-5 pt-5 pb-4 flex flex-col transition-colors duration-200">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Event Distribution</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">By event type</p>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={68}
            paddingAngle={3}
            dataKey="value"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, idx) => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <ul className="mt-2 space-y-1.5">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">{entry.name}</span>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventPieChart;
