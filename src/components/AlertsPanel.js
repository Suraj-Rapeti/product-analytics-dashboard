import React from 'react';
import { AlertTriangle, TrendingDown, AlertCircle } from 'lucide-react';

export default function AlertsPanel({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/75 backdrop-blur-md p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] animate-fade-up">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          ✅ No Alerts
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your metrics are healthy. Keep monitoring for optimal performance.
        </p>
      </section>
    );
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <TrendingDown className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/40';
      case 'warning':
        return 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/40';
      default:
        return 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/40';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'critical':
        return 'text-red-700 dark:text-red-200';
      case 'warning':
        return 'text-amber-700 dark:text-amber-200';
      default:
        return 'text-blue-700 dark:text-blue-200';
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/75 backdrop-blur-md p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] animate-fade-up">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        🚨 Active Alerts ({alerts.length})
      </h3>

      <div className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-3 ${getAlertColor(alert.type)}`}
          >
            <div className="flex gap-3">
              <div className={`flex-shrink-0 ${getTextColor(alert.type)}`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold ${getTextColor(alert.type)}`}>
                  {alert.title}
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {alert.message}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/40 dark:bg-slate-800/40 inline-block px-2 py-1 rounded">
                  💡 {alert.action}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
