import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiDollarSign, FiVideo, FiFileText, FiCalendar, FiShield } from 'react-icons/fi';
import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';

const FEATURES = [
  { icon: FiUsers, title: 'সদস্য ব্যবস্থাপনা', desc: 'রেজিস্ট্রেশন থেকে ডিজিটাল মেম্বারশিপ কার্ড পর্যন্ত সবকিছু এক জায়গায়।' },
  { icon: FiDollarSign, title: 'তহবিল ও চাঁদা', desc: 'মাসিক চাঁদা, অনুদান, খরচ — QR-ভেরিফাইড রশিদ সহ স্বচ্ছ হিসাব।' },
  { icon: FiVideo, title: 'রিয়েল-টাইম মিটিং', desc: 'নিজস্ব প্ল্যাটফর্মে ভিডিও কনফারেন্স, ওয়েটিং রুম ও হোস্ট কন্ট্রোল সহ।' },
  { icon: FiCalendar, title: 'ইভেন্ট ও উপস্থিতি', desc: 'রেজিস্ট্রেশন, QR অ্যাটেনডেন্স ও সার্টিফিকেট — সবকিছু স্বয়ংক্রিয়।' },
  { icon: FiFileText, title: 'নোটিশ ও রিপোর্ট', desc: 'ইমেইল নোটিফিকেশন সহ নোটিশ প্রকাশ, PDF/Excel রিপোর্ট এক ক্লিকে।' },
  { icon: FiShield, title: 'নিরাপদ ও নির্ভরযোগ্য', desc: 'রোল-ভিত্তিক অ্যাক্সেস কন্ট্রোল ও এনক্রিপ্টেড ডেটা সুরক্ষা।' },
];

const LandingPage = () => (
  <div className="relative min-h-screen overflow-hidden">
    <div className="aurora-bg" />

    <header className="flex items-center justify-between px-6 sm:px-10 py-6">
      <Logo />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link to="/login" className="btn-ghost !py-2 !px-5 text-sm">
          লগইন
        </Link>
      </div>
    </header>

    <main className="px-6 sm:px-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto text-center pt-12 pb-20"
      >
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-slate-800 dark:text-white leading-tight">
          আপনার সংগঠন পরিচালনার
          <br />
          <span className="bg-gradient-brand bg-clip-text text-transparent">সম্পূর্ণ ডিজিটাল সমাধান</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-5 text-base sm:text-lg">
          সদস্য, তহবিল, মিটিং, ইভেন্ট ও যোগাযোগ — ISHAS Organization Management System দিয়ে সবকিছু এক জায়গা থেকে
          পরিচালনা করুন।
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/register" className="btn-gradient !px-8">
            সদস্য হন
          </Link>
          <Link to="/login" className="btn-ghost !px-8">
            লগইন করুন
          </Link>
        </div>
      </motion.section>

      <section className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
        {FEATURES.map(({ icon: Icon, title, desc }, idx) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.06 }}
            className="glass-card p-6"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center mb-4">
              <Icon size={20} />
            </div>
            <p className="font-semibold text-slate-800 dark:text-white mb-1.5">{title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
          </motion.div>
        ))}
      </section>
    </main>

    <footer className="text-center text-xs text-slate-400 pb-8">
      © {new Date().getFullYear()} ISHAS Organization. সর্বস্বত্ব সংরক্ষিত।
    </footer>
  </div>
);

export default LandingPage;
