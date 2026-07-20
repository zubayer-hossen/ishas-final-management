import { motion } from 'framer-motion';
import Logo from '../ui/Logo';
import ThemeToggle from '../ui/ThemeToggle';

/**
 * Shared shell for all authentication screens: animated aurora backdrop,
 * centered glass card, and a header with the ISHAS wordmark + theme toggle.
 */
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="aurora-bg" />

      <div className="absolute top-5 inset-x-0 flex items-center justify-between px-6 sm:px-10">
        <Logo />
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-card w-full max-w-md p-8 sm:p-10"
      >
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1.5">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>

        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;
