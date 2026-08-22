'use client';

import { motion } from 'framer-motion';

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  delay = 0,
}) {
  const colorStyles = {
    blue: {
      bg: 'rgba(37, 99, 235, 0.08)',
      border: 'rgba(37, 99, 235, 0.2)',
      iconBg: 'rgba(37, 99, 235, 0.15)',
      iconColor: '#3b82f6',
      accent: '#2563eb',
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.2)',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#10b981',
      accent: '#059669',
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.2)',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#f59e0b',
      accent: '#d97706',
    },
    rose: {
      bg: 'rgba(246, 12, 73, 0.08)',
      border: 'rgba(246, 12, 73, 0.2)',
      iconBg: 'rgba(246, 12, 73, 0.15)',
      iconColor: '#f60c49',
      accent: '#f60c49',
    },
    purple: {
      bg: 'rgba(139, 92, 246, 0.08)',
      border: 'rgba(139, 92, 246, 0.2)',
      iconBg: 'rgba(139, 92, 246, 0.15)',
      iconColor: '#a855f7',
      accent: '#7c3aed',
    },
  };

  const currentStyle = colorStyles[color] || colorStyles.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="relative overflow-hidden rounded-2xl p-5 border backdrop-blur-md transition-all hover:shadow-lg hover:-translate-y-0.5"
      style={{
        backgroundColor: currentStyle.bg,
        borderColor: currentStyle.border,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-[#101942] tracking-tight">
              {value}
            </h3>
            {trend && (
              <span className="text-xs font-bold text-slate-600 bg-white/70 px-2 py-0.5 rounded-full border border-slate-200">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>

        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner"
          style={{ backgroundColor: currentStyle.iconBg }}
        >
          {Icon && <Icon size={24} style={{ color: currentStyle.iconColor }} />}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-70"
        style={{ backgroundColor: currentStyle.accent }}
      />
    </motion.div>
  );
}
