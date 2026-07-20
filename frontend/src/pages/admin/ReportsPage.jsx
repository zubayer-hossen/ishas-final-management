import { FiFileText, FiFile, FiDownload } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const REPORTS = [
  { key: 'financial', title: 'আর্থিক প্রতিবেদন', desc: 'সব লেনদেনের বিস্তারিত হিসাব, আয়/ব্যয়/ব্যালেন্স সহ' },
  { key: 'members', title: 'সদস্য তালিকা প্রতিবেদন', desc: 'সব সদস্যের তথ্য, রোল ও স্ট্যাটাস সহ' },
  { key: 'dues', title: 'বকেয়া প্রতিবেদন', desc: 'যেসব সদস্যের চাঁদা বকেয়া আছে তাদের তালিকা' },
];

const ReportCard = ({ title, desc, reportKey }) => (
  <div className="glass-card p-6 flex flex-col justify-between">
    <div>
      <div className="w-11 h-11 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center mb-4">
        <FiFileText size={20} />
      </div>
      <p className="font-semibold text-slate-800 dark:text-white">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{desc}</p>
    </div>

    <div className="flex gap-2 mt-5">
      <a
        href={`${API_BASE_URL}/reports/${reportKey}?format=pdf`}
        target="_blank"
        rel="noreferrer"
        className="btn-ghost flex-1 !py-2 text-sm flex items-center justify-center gap-1.5"
      >
        <FiFile size={14} /> PDF
      </a>
      <a
        href={`${API_BASE_URL}/reports/${reportKey}?format=excel`}
        target="_blank"
        rel="noreferrer"
        className="btn-ghost flex-1 !py-2 text-sm flex items-center justify-center gap-1.5"
      >
        <FiDownload size={14} /> Excel
      </a>
    </div>
  </div>
);

const ReportsPage = () => (
  <div className="max-w-5xl mx-auto pt-6 space-y-5">
    <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">রিপোর্ট ডাউনলোড</h1>
    <p className="text-sm text-slate-500 dark:text-slate-400 -mt-3">
      যেকোনো প্রতিবেদন PDF অথবা Excel ফরম্যাটে ডাউনলোড করুন। ইভেন্ট বা মিটিং-ভিত্তিক উপস্থিতি প্রতিবেদন সংশ্লিষ্ট
      ইভেন্ট/মিটিং পেজ থেকে ডাউনলোড করা যাবে।
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {REPORTS.map((r) => (
        <ReportCard key={r.key} title={r.title} desc={r.desc} reportKey={r.key} />
      ))}
    </div>
  </div>
);

export default ReportsPage;
