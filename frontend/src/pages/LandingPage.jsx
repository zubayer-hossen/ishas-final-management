import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiDollarSign,
  FiVideo,
  FiFileText,
  FiCalendar,
  FiShield,
  FiArrowRight,
  FiUserPlus,
  FiCheckCircle,
  FiGrid,
  FiEye,
  FiHeart,
} from 'react-icons/fi';
import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';
import BannerSlider from '../components/home/BannerSlider';
import { useGetPublicBannersQuery } from '../features/banner/bannerApi';
import { useGetBlogsQuery } from '../features/blog/blogApi';
import { BLOG_CATEGORY_LABELS } from '../utils/blogCategories';
import { timeAgoBn } from '../utils/timeAgo';

const FEATURES = [
  { icon: FiUsers, title: 'সদস্য ব্যবস্থাপনা', desc: 'রেজিস্ট্রেশন থেকে ডিজিটাল মেম্বারশিপ কার্ড পর্যন্ত সবকিছু এক জায়গায়।' },
  { icon: FiDollarSign, title: 'তহবিল ও চাঁদা', desc: 'মাসিক চাঁদা, অনুদান, খরচ — QR-ভেরিফাইড রশিদ সহ স্বচ্ছ হিসাব।' },
  { icon: FiVideo, title: 'রিয়েল-টাইম মিটিং', desc: 'নিজস্ব প্ল্যাটফর্মে ভিডিও কনফারেন্স, ওয়েটিং রুম ও হোস্ট কন্ট্রোল সহ।' },
  { icon: FiCalendar, title: 'ইভেন্ট ও উপস্থিতি', desc: 'রেজিস্ট্রেশন, QR অ্যাটেনডেন্স ও সার্টিফিকেট — সবকিছু স্বয়ংক্রিয়।' },
  { icon: FiFileText, title: 'নোটিশ ও রিপোর্ট', desc: 'ইমেইল নোটিফিকেশন সহ নোটিশ প্রকাশ, PDF/Excel রিপোর্ট এক ক্লিকে।' },
  { icon: FiShield, title: 'নিরাপদ ও নির্ভরযোগ্য', desc: 'রোল-ভিত্তিক অ্যাক্সেস কন্ট্রোল ও এনক্রিপ্টেড ডেটা সুরক্ষা।' },
];

const STEPS = [
  { icon: FiUserPlus, title: 'রেজিস্ট্রেশন করুন', desc: 'কয়েক মিনিটেই একাউন্ট খুলুন এবং ইমেইল OTP দিয়ে ভেরিফাই করুন।' },
  { icon: FiCheckCircle, title: 'অনুমোদনের অপেক্ষা করুন', desc: 'সংগঠনের এডমিন আপনার সদস্যপদ যাচাই করে অনুমোদন দেবেন।' },
  { icon: FiGrid, title: 'সম্পূর্ণ অ্যাক্সেস পান', desc: 'ড্যাশবোর্ড থেকে চাঁদা, ইভেন্ট, মিটিং, নোটিশ সবকিছু ব্যবহার করুন।' },
];

const FallbackHero = () => (
  <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[560px] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-brand flex items-center">
    <div className="absolute inset-0 bg-gradient-aurora opacity-40" />
    <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-2xl">
      <h2 className="text-white font-display font-bold text-xl sm:text-3xl lg:text-4xl leading-tight">
        আপনার সংগঠন পরিচালনার সম্পূর্ণ ডিজিটাল সমাধান
      </h2>
      <p className="text-white/85 mt-3 text-sm sm:text-base max-w-lg">
        সদস্য, তহবিল, মিটিং, ইভেন্ট ও যোগাযোগ — সবকিছু এক জায়গা থেকে পরিচালনা করুন।
      </p>
      <Link to="/register" className="btn-gradient inline-flex mt-6 !bg-white !text-primary-700">
        সদস্য হন
      </Link>
    </div>
  </div>
);

const LandingPage = () => {
  const { data: bannerData } = useGetPublicBannersQuery();
  const { data: blogData } = useGetBlogsQuery({ limit: 3 });

  const banners = bannerData?.data || [];
  const blogs = blogData?.data?.blogs || [];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="aurora-bg" />

      {/* -------- Header -------- */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/60 dark:bg-slate-950/60 border-b border-white/40 dark:border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 py-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-primary-600 transition-colors">বৈশিষ্ট্য</a>
            <Link to="/blog" className="hover:text-primary-600 transition-colors">ব্লগ</Link>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">কীভাবে কাজ করে</a>
          </nav>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />
            <Link to="/login" className="btn-ghost !py-2 !px-4 sm:!px-5 text-sm">
              লগইন
            </Link>
            <Link to="/register" className="btn-gradient !py-2 !px-4 sm:!px-5 text-sm hidden sm:inline-flex">
              সদস্য হন
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* -------- Hero / Banner Slider -------- */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-8 sm:pt-12"
        >
          {banners.length > 0 ? <BannerSlider banners={banners} /> : <FallbackHero />}
        </motion.section>

        {/* -------- Intro copy -------- */}
        <section className="max-w-2xl mx-auto text-center pt-12 sm:pt-16 pb-4">
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-slate-800 dark:text-white leading-tight">
            সংগঠন পরিচালনা এখন আরও{' '}
            <span className="bg-gradient-brand bg-clip-text text-transparent">সহজ ও স্বচ্ছ</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm sm:text-base">
            সদস্য, তহবিল, মিটিং, ইভেন্ট ও যোগাযোগ — ISHAS Organization Management System দিয়ে সবকিছু এক জায়গা থেকে
            পরিচালনা করুন।
          </p>
        </section>

        {/* -------- Features -------- */}
        <section id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-14 scroll-mt-20">
          {FEATURES.map(({ icon: Icon, title, desc }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
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

        {/* -------- How it works -------- */}
        <section id="how-it-works" className="py-14 scroll-mt-20">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800 dark:text-white text-center mb-10">
            মাত্র তিনটি ধাপে শুরু করুন
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {STEPS.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-brand text-white flex items-center justify-center mb-4 shadow-glow">
                  <Icon size={26} />
                </div>
                <p className="font-semibold text-slate-800 dark:text-white mb-1.5">
                  {idx + 1}. {title}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* -------- Latest Blog Posts (public, non-sensitive) -------- */}
        {blogs.length > 0 && (
          <section className="py-14">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800 dark:text-white">সাম্প্রতিক ব্লগ</h2>
              <Link
                to="/blog"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                সব দেখুন <FiArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {blogs.map((blog, idx) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                >
                  <Link to={`/blog/${blog.slug}`} className="glass-card overflow-hidden block group">
                    <div className="aspect-video bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      {blog.coverImage?.url && (
                        <img
                          src={blog.coverImage.url}
                          alt={blog.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300">
                        {BLOG_CATEGORY_LABELS[blog.category] || blog.category}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-white mt-2.5 leading-snug line-clamp-2">
                        {blog.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-3">
                        <span className="flex items-center gap-1">
                          <FiEye size={11} /> {blog.views ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiHeart size={11} /> {blog.likeCount ?? 0}
                        </span>
                        <span>{timeAgoBn(blog.publishedAt || blog.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* -------- CTA -------- */}
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card text-center py-12 px-6 sm:px-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-aurora opacity-30 -z-10" />
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800 dark:text-white mb-3">
              আজই সংগঠনের সদস্য হয়ে যান
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              রেজিস্ট্রেশন করুন, ইমেইল ভেরিফাই করুন, এবং এডমিনের অনুমোদনের পর সম্পূর্ণ সুবিধা উপভোগ করুন।
            </p>
            <Link to="/register" className="btn-gradient inline-flex !px-8">
              এখনই রেজিস্ট্রেশন করুন
            </Link>
          </motion.div>
        </section>
      </main>

      {/* -------- Footer -------- */}
      <footer className="border-t border-white/40 dark:border-white/5 mt-4">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/blog" className="hover:text-primary-600 transition-colors">ব্লগ</Link>
            <Link to="/login" className="hover:text-primary-600 transition-colors">লগইন</Link>
            <Link to="/register" className="hover:text-primary-600 transition-colors">রেজিস্ট্রেশন</Link>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} ISHAS Organization. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
