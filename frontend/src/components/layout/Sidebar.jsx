import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUser,
  FiDollarSign,
  FiBell,
  FiCalendar,
  FiVideo,
  FiFileText,
  FiHelpCircle,
  FiX,
  FiUsers,
  FiBriefcase,
  FiPieChart,
  FiDownload,
  FiSettings,
  FiImage,
} from 'react-icons/fi';
import { useAppSelector } from '../../app/hooks';
import Logo from '../ui/Logo';
import { ADMIN_ACCESS_ROLES } from '../../utils/roles';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'হোম', icon: FiHome, end: true },
  { to: '/dashboard/profile', label: 'প্রোফাইল', icon: FiUser },
  { to: '/dashboard/dues', label: 'চাঁদা ও বকেয়া', icon: FiDollarSign },
  { to: '/dashboard/notices', label: 'নোটিশ', icon: FiBell },
  { to: '/dashboard/events', label: 'ইভেন্ট', icon: FiCalendar },
  { to: '/dashboard/meetings', label: 'মিটিং', icon: FiVideo },
  { to: '/dashboard/gallery', label: 'গ্যালারি', icon: FiImage },
  { to: '/dashboard/blogs', label: 'ব্লগ', icon: FiFileText },
  { to: '/dashboard/support', label: 'সাপোর্ট', icon: FiHelpCircle },
];

const ADMIN_NAV_ITEMS = [
  { to: '/dashboard/admin', label: 'এডমিন প্যানেল', icon: FiPieChart, end: true },
  { to: '/dashboard/admin/members', label: 'সদস্য ব্যবস্থাপনা', icon: FiUsers },
  { to: '/dashboard/admin/committees', label: 'কমিটি', icon: FiBriefcase },
  { to: '/dashboard/admin/funds', label: 'তহবিল ব্যবস্থাপনা', icon: FiDollarSign },
  { to: '/dashboard/admin/notices', label: 'নোটিশ পরিচালনা', icon: FiBell },
  { to: '/dashboard/admin/events', label: 'ইভেন্ট পরিচালনা', icon: FiCalendar },
  { to: '/dashboard/admin/blogs', label: 'ব্লগ পরিচালনা', icon: FiFileText },
  { to: '/dashboard/admin/gallery', label: 'গ্যালারি পরিচালনা', icon: FiImage },
  { to: '/dashboard/admin/tickets', label: 'সাপোর্ট টিকেট', icon: FiHelpCircle, roles: ['owner', 'super_admin', 'admin'] },
  { to: '/dashboard/admin/reports', label: 'রিপোর্ট', icon: FiDownload },
  { to: '/dashboard/admin/settings', label: 'সেটিংস', icon: FiSettings, roles: ['owner'] },
];

const Sidebar = ({ isOpen, onClose }) => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="glass-card h-full m-0 lg:m-3 rounded-none lg:rounded-xl2 flex flex-col p-5">
          <div className="flex items-center justify-between mb-8">
            <Logo />
            <button onClick={onClose} className="lg:hidden text-slate-500" aria-label="বন্ধ করুন">
              <FiX size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gradient-brand text-white shadow-glow'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}

            {ADMIN_ACCESS_ROLES.includes(user?.role) && (
              <>
                <p className="px-4 pt-5 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  ব্যবস্থাপনা
                </p>
                {ADMIN_NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user?.role)).map(
                  ({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-gradient-brand text-white shadow-glow'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <img
              src={user?.profilePicture?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=4f46e5&color=fff`}
              alt={user?.fullName}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.memberId || user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
