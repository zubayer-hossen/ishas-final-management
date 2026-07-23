import { FiMenu } from 'react-icons/fi';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from '../notifications/NotificationBell';
import UserMenu from './UserMenu';

const Topbar = ({ onMenuClick }) => (
  <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-4">
    <button
      onClick={onMenuClick}
      className="lg:hidden w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-600 dark:text-slate-200"
      aria-label="মেনু খুলুন"
    >
      <FiMenu size={18} />
    </button>

    <div className="flex-1" />

    <div className="flex items-center gap-3">
      <NotificationBell />
      <ThemeToggle />
      <UserMenu />
    </div>
  </header>
);

export default Topbar;
