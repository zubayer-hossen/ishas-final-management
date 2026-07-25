import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import ThemeToggle from '../ui/ThemeToggle';
import { useAppSelector } from '../../app/hooks';

const PublicLayout = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/blog">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-ghost !py-2 !px-4 text-sm">
                ড্যাশবোর্ড
              </Link>
            ) : (
              <Link to="/login" className="btn-gradient !py-2 !px-5 text-sm">
                লগইন
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="text-center text-xs text-slate-400 py-8">
        © {new Date().getFullYear()} ISHAS Organization. সর্বস্বত্ব সংরক্ষিত।
      </footer>
    </div>
  );
};

export default PublicLayout;
