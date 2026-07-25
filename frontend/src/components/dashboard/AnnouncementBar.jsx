import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import { useGetNoticesQuery } from '../../features/notice/noticeApi';

const DISMISSED_KEY = 'ishas-dismissed-announcement';

/**
 * Shows the single most important active notice (pinned, or urgent
 * category) as a slim banner across the top of the dashboard — mirrors
 * the "Live Announcement Bar" feature. Remembers dismissal per-notice
 * (via localStorage) so it doesn't nag once the person has seen it, but
 * reappears automatically if a newer important notice is published.
 */
const AnnouncementBar = () => {
  const { data } = useGetNoticesQuery({ limit: 5 });
  const [dismissedId, setDismissedId] = useState(() => localStorage.getItem(DISMISSED_KEY));

  const notices = data?.data?.notices || [];
  const topNotice = notices.find((n) => n.isPinned || n.category === 'urgent');

  if (!topNotice || dismissedId === topNotice._id) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, topNotice._id);
    setDismissedId(topNotice._id);
  };

  const isUrgent = topNotice.category === 'urgent';

  return (
    <div
      className={`flex items-center gap-3 px-4 sm:px-6 py-2.5 text-sm ${
        isUrgent ? 'bg-danger/10 text-danger' : 'bg-primary-500/10 text-primary-700 dark:text-primary-300'
      }`}
    >
      <FiAlertCircle size={16} className="shrink-0" />
      <Link to="/dashboard/notices" className="flex-1 min-w-0 truncate font-medium hover:underline">
        {topNotice.title}
      </Link>
      <button onClick={handleDismiss} className="shrink-0 opacity-70 hover:opacity-100 p-1" aria-label="বন্ধ করুন">
        <FiX size={15} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
