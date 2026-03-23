import React from 'react';
import { Sparkles, TrendingUp, Info, AlertTriangle } from 'lucide-react';

const typeConfig = {
  positive: {
    icon:       TrendingUp,
    iconColor:  'text-emerald-500 dark:text-emerald-400',
    border:     'border-emerald-400 dark:border-emerald-500/60',
    badge:      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    badgeLabel: 'Positive',
  },
  info: {
    icon:       Info,
    iconColor:  'text-brand-500 dark:text-brand-400',
    border:     'border-brand-400 dark:border-brand-500/60',
    badge:      'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    badgeLabel: 'Info',
  },
  warning: {
    icon:       AlertTriangle,
    iconColor:  'text-amber-500 dark:text-amber-400',
    border:     'border-amber-400 dark:border-amber-500/60',
    badge:      'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    badgeLabel: 'Action needed',
  },
};

function InsightItem({ insight }) {
  const cfg = typeConfig[insight.type] || typeConfig.info;
  const Icon = cfg.icon;

  return (
    <div className={`flex gap-3 pl-4 border-l-2 ${cfg.border}`}>
      <div className="mt-0.5">
        <Icon size={15} className={cfg.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{insight.title}</p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
            {cfg.badgeLabel}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {insight.description}
        </p>
      </div>
    </div>
  );
}

function AIInsightsPanel({ insights = [] }) {
  const normalizedInsights = Array.isArray(insights) ? insights : [];

  return (
    <div className="bg-white dark:bg-slate-800/80 dark:ring-1 dark:ring-slate-700/50 rounded-xl shadow-card dark:shadow-none px-5 py-5 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">AI Insights</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Powered by AI · Updated just now</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Insight list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {normalizedInsights.map((insight) => (
          <InsightItem key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}

export default AIInsightsPanel;
