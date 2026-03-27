import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function AnomaliesPanel({ anomalies }) {
  // Only show if there are HIGH severity anomalies
  const highSeverityAnomalies = anomalies?.filter(a => a.severity === 'high') || [];
  
  if (!highSeverityAnomalies || highSeverityAnomalies.length === 0) {
    return null; // Don't render anything if no significant anomalies
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="rounded-2xl border border-orange-200/50 dark:border-orange-900/40 bg-orange-50/30 dark:bg-orange-950/10 backdrop-blur-md p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] animate-fade-up">
      <h3 className="text-base font-semibold text-orange-900 dark:text-orange-200 flex items-center gap-2">
        ⚠️ Anomalies Detected ({highSeverityAnomalies.length})
      </h3>

      <div className="mt-4 space-y-3">
        {highSeverityAnomalies.map((anomaly) => {
          const isSpike = anomaly.type === 'spike';

          return (
            <div key={anomaly.id} className="rounded-lg border border-orange-200/60 dark:border-orange-900/50 bg-white dark:bg-slate-800/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isSpike ? (
                      <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    )}
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                      {isSpike ? '📈 Spike' : '📉 Drop'} on {formatDate(anomaly.date)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {anomaly.metric === 'revenue' ? '💰 Revenue' : '📦 Orders'}: <span className="font-semibold">${anomaly.value.toLocaleString()}</span> ({isSpike ? '+' : '-'}{anomaly.change}% change)
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
