import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useAppSelector } from '../../app/hooks';
import MembershipCard from '../../components/dashboard/MembershipCard';
import { useGetMyDuesQuery } from '../../features/member/memberApi';
import { useGetNoticesQuery } from '../../features/notice/noticeApi';
import { useGetEventsQuery } from '../../features/event/eventApi';
import { toBanglaDigits as toBn } from '../../utils/banglaDigits';

const DashboardHomePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { data: duesData } = useGetMyDuesQuery();
  const { data: noticesData } = useGetNoticesQuery({ limit: 3 });
  const { data: eventsData } = useGetEventsQuery({ upcoming: true, limit: 3 });

  const dues = duesData?.data;
  const notices = noticesData?.data?.notices || [];
  const events = eventsData?.data?.events || [];

  return (
    <div className="max-w-6xl mx-auto pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">
          স্বাগতম, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">আপনার ড্যাশবোর্ডে আপনাকে স্বাগতম</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MembershipCard user={user} />

        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">মোট বকেয়া</p>
            <p className="text-3xl font-data font-bold text-danger">
              {toBn(dues?.totalDue ?? 0)} <span className="text-base">টাকা</span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              পরবর্তী বকেয়া মাস: {dues?.nextDueMonth ? toBn(dues.nextDueMonth) : 'নেই'}
            </p>
          </div>
          <Link
            to="/dashboard/dues"
            className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            বিস্তারিত দেখুন <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">সদস্যপদ স্ট্যাটাস</p>
            <p className="text-xl font-semibold text-slate-800 dark:text-white capitalize">
              {user?.membershipStatus}
            </p>
            <p className="text-xs text-slate-400 mt-2">রোল: {user?.role}</p>
          </div>
          <Link
            to="/dashboard/profile"
            className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            প্রোফাইল দেখুন <FiArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">সাম্প্রতিক নোটিশ</h2>
            <Link to="/dashboard/notices" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              সব দেখুন
            </Link>
          </div>
          {notices.length === 0 ? (
            <p className="text-sm text-slate-400">কোনো নোটিশ নেই</p>
          ) : (
            <ul className="space-y-3">
              {notices.map((n) => (
                <li key={n._id} className="text-sm">
                  <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{n.title}</p>
                  <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString('bn-BD')}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">আসন্ন ইভেন্ট</h2>
            <Link to="/dashboard/events" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              সব দেখুন
            </Link>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-slate-400">কোনো আসন্ন ইভেন্ট নেই</p>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e._id} className="text-sm">
                  <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{e.title}</p>
                  <p className="text-xs text-slate-400">{new Date(e.startDate).toLocaleDateString('bn-BD')}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
