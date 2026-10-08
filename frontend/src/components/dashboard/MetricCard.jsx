import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function MetricCard({
  title,
  value,
  unit,
  change,
  period,
  trend = 'neutral',
  icon: Icon,
  sparklineData,
  urgentAlertList,
}) {
  return (
    <div className="bg-surface-white rounded-[22px] p-5 lg:p-6 border border-border-card shadow-card-clean flex flex-col justify-between relative overflow-hidden transition-all duration-150 hover:border-gray-300">
      <div className="flex items-start justify-between">
        <h3 className="text-xs sm:text-sm font-semibold text-text-main leading-snug max-w-[150px]">
          {title}
        </h3>
        {Icon && (
          <div className="w-8 h-8 rounded-full bg-brand-blood-light flex items-center justify-center text-brand-blood shrink-0">
            <Icon className="w-4 h-4 fill-brand-blood/20" />
          </div>
        )}
      </div>

      {urgentAlertList ? (
        <div className="space-y-1.5 mt-3">
          {urgentAlertList.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#FBE7EA] text-xs font-semibold text-brand-blood"
            >
              <span>{item.group}</span>
              <span>{item.units}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl lg:text-4xl font-bold text-text-main tracking-tight">
              {value}
            </span>
            {unit && <span className="text-xs text-text-muted font-medium">{unit}</span>}
          </div>

          {(change || period) && (
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              {change && (
                <span
                  className={`font-semibold ${
                    trend === 'up'
                      ? 'text-emerald-700'
                      : trend === 'down'
                      ? 'text-brand-blood'
                      : 'text-amber-700'
                  }`}
                >
                  {change}
                </span>
              )}
              {period && <span className="text-text-muted">{period}</span>}
            </div>
          )}
        </div>
      )}

      {/* Sparkline wave if data is provided */}
      {sparklineData && (
        <div className="h-12 -mx-6 -mb-6 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id="metricWave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C52233" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C52233" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#C52233"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#metricWave)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
