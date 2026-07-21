import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllTicketsQuery } from '../../features/support/supportApi';
import Spinner from '../../components/ui/Spinner';

const STATUS_LABELS = {
  open: { label: 'খোলা', className: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' },
  in_progress: { label: 'প্রক্রিয়াধীন', className: 'bg-warning/15 text-warning' },
  resolved: { label: 'সমাধান হয়েছে', className: 'bg-success/15 text-success' },
  closed: { label: 'বন্ধ', className: 'bg-slate-100 dark:bg-slate-800 text-slate-400' },
};

const PRIORITY_LABELS = {
  low: 'নিম্ন',
  medium: 'মাঝারি',
  high: 'উচ্চ',
  urgent: 'জরুরি',
};

const TicketManagementPage = () => {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useGetAllTicketsQuery({ status: status || undefined, limit: 50 });

  const tickets = data?.data?.tickets || [];

  return (
    <div className="max-w-5xl mx-auto pt-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">সাপোর্ট টিকেট পরিচালনা</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field sm:w-52">
          <option value="">সব স্ট্যাটাস</option>
          <option value="open">খোলা</option>
          <option value="in_progress">প্রক্রিয়াধীন</option>
          <option value="resolved">সমাধান হয়েছে</option>
          <option value="closed">বন্ধ</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const s = STATUS_LABELS[t.status] || STATUS_LABELS.open;
            return (
              <Link
                key={t._id}
                to={`/dashboard/support/tickets/${t._id}`}
                className="glass-card p-5 flex items-center justify-between gap-4 block"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-slate-400 font-data">{t.ticketNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {PRIORITY_LABELS[t.priority]}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-white truncate">{t.subject}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t.createdBy?.fullName} ({t.createdBy?.memberId || t.createdBy?.email})
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${s.className}`}>
                  {s.label}
                </span>
              </Link>
            );
          })}
          {tickets.length === 0 && <div className="glass-card p-10 text-center text-slate-400">কোনো টিকেট নেই</div>}
        </div>
      )}
    </div>
  );
};

export default TicketManagementPage;
