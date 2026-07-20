import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FiUsers, FiTrendingUp, FiTrendingDown, FiUserCheck } from 'react-icons/fi';
import { useGetAllMembersQuery } from '../../features/member/memberApi';
import { useGetAllTransactionsQuery } from '../../features/transaction/transactionApi';
import { useGetEventsQuery } from '../../features/event/eventApi';
import { useGetMeetingsQuery } from '../../features/meeting/meetingApi';
import CalendarWidget from '../../components/admin/CalendarWidget';
import Spinner from '../../components/ui/Spinner';
import { toBanglaDigits } from '../../utils/banglaDigits';
import { ROLE_LABELS } from '../../utils/roles';

const PIE_COLORS = ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9'];

const TONE_CLASSES = {
  primary: 'bg-primary-500/10 text-primary-600',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
};

const StatCard = ({ icon: Icon, label, value, tone = 'primary' }) => (
  <div className="glass-card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${TONE_CLASSES[tone]}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-xl font-data font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const sixMonthsAgo = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    return d.toISOString();
  }, []);

  const { data: membersData, isLoading: membersLoading } = useGetAllMembersQuery({ limit: 1000 });
  const { data: txData, isLoading: txLoading } = useGetAllTransactionsQuery({ from: sixMonthsAgo, limit: 1000 });
  const { data: eventsData } = useGetEventsQuery({ upcoming: true, limit: 10 });
  const { data: meetingsData } = useGetMeetingsQuery({ upcoming: true, limit: 10 });

  const members = membersData?.data?.members || [];
  const transactions = txData?.data?.transactions || [];
  const summary = txData?.data?.summary || { income: 0, expense: 0, balance: 0 };

  const activeMembers = members.filter((m) => m.membershipStatus === 'active').length;
  const pendingApprovals = members.filter((m) => m.membershipStatus === 'pending').length;

  const monthlyChartData = useMemo(() => {
    const buckets = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!buckets[key]) buckets[key] = { month: key, income: 0, expense: 0 };
      buckets[key][t.type] += t.amount;
    });
    return Object.values(buckets).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const roleChartData = useMemo(() => {
    const counts = {};
    members.forEach((m) => {
      counts[m.role] = (counts[m.role] || 0) + 1;
    });
    return Object.entries(counts).map(([role, value]) => ({ name: ROLE_LABELS[role] || role, value }));
  }, [members]);

  const calendarMarkers = useMemo(() => {
    const events = (eventsData?.data?.events || []).map((e) => ({
      date: e.startDate,
      label: e.title,
      type: 'event',
    }));
    const meetings = (meetingsData?.data?.meetings || []).map((m) => ({
      date: m.scheduledStart,
      label: m.title,
      type: 'meeting',
    }));
    return [...events, ...meetings];
  }, [eventsData, meetingsData]);

  if (membersLoading || txLoading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner size={28} className="text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-6 space-y-6">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">এডমিন প্যানেল</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiUsers} label="সক্রিয় সদস্য" value={toBanglaDigits(activeMembers)} tone="primary" />
        <StatCard icon={FiUserCheck} label="অনুমোদনের অপেক্ষায়" value={toBanglaDigits(pendingApprovals)} tone="warning" />
        <StatCard icon={FiTrendingUp} label="মোট আয় (৬ মাস)" value={`৳${toBanglaDigits(summary.income)}`} tone="success" />
        <StatCard icon={FiTrendingDown} label="মোট ব্যয় (৬ মাস)" value={`৳${toBanglaDigits(summary.expense)}`} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">মাসিক আয়-ব্যয় প্রবণতা</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis dataKey="month" fontSize={11} stroke="currentColor" className="text-slate-400" />
              <YAxis fontSize={11} stroke="currentColor" className="text-slate-400" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
              <Bar dataKey="income" name="আয়" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="ব্যয়" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">সদস্য বিন্যাস</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={roleChartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {roleChartData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {roleChartData.map((entry, index) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                {entry.name} ({toBanglaDigits(entry.value)})
              </span>
            ))}
          </div>
        </div>
      </div>

      <CalendarWidget markers={calendarMarkers} />
    </div>
  );
};

export default AdminDashboardPage;
