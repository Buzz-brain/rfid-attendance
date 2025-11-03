import { motion } from 'framer-motion';

export const StatsCard = ({ icon: Icon, label, value, trend, subtitle = '', variant = 'blue', className = '' }) => {
  const VARIANTS = {
    blue: { title: 'text-blue-900', subtitle: 'text-blue-500', iconBg: 'linear-gradient(135deg,#2563eb,#3b82f6)' },
    purple: { title: 'text-purple-900', subtitle: 'text-purple-500', iconBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
    green: { title: 'text-green-900', subtitle: 'text-green-500', iconBg: 'linear-gradient(135deg,#16a34a,#4ade80)' },
    orange: { title: 'text-orange-900', subtitle: 'text-orange-500', iconBg: 'linear-gradient(135deg,#fb923c,#f97316)' }
  };

  const colors = VARIANTS[variant] || VARIANTS.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(2,6,23,0.08)' }}
      className={`glass rounded-2xl p-5 transition-all duration-200 shadow-md flex items-center gap-4 ${className}`}
    >
      <div
        className="flex items-center justify-center w-14 h-14 rounded-full flex-shrink-0"
        style={{ background: colors.iconBg }}
        aria-hidden="true"
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold mb-1 tracking-wide ${colors.title}`}>{label}</div>
        <div className={`text-2xl font-extrabold leading-tight ${colors.title}`}>{value}</div>
        {subtitle && <div className={`text-xs mt-1 font-medium ${colors.subtitle}`}>{subtitle}</div>}
        {trend && (
          <div className="mt-1">
            <span className={`text-xs font-semibold ${trend.positive ? 'text-success' : 'text-destructive'}`}>{trend.value}</span>
            <span className="text-xs text-muted-foreground ml-2">{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
