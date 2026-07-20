import { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from '../../features/notification/notificationApi';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data } = useGetNotificationsQuery({ limit: 8 }, { pollingInterval: 60000 });
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-600 dark:text-slate-200"
        aria-label="নোটিফিকেশন"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '৯+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto glass-card p-3 z-50">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">নোটিফিকেশন</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                সব পঠিত করুন
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">কোনো নোটিফিকেশন নেই</p>
          ) : (
            <ul className="space-y-1">
              {notifications.map((n) => (
                <li key={n._id}>
                  <Link
                    to={n.link || '#'}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n._id);
                      setOpen(false);
                    }}
                    className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      n.isRead
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'bg-primary-50 dark:bg-primary-900/20 text-slate-700 dark:text-slate-100 font-medium'
                    } hover:bg-slate-100 dark:hover:bg-slate-800`}
                  >
                    <p className="truncate">{n.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{n.message}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
