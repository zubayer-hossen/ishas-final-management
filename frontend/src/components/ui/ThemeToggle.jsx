import { FiMoon, FiSun } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleTheme } from '../../features/theme/themeSlice';

const ThemeToggle = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={mode === 'dark' ? 'লাইট মোডে যান' : 'ডার্ক মোডে যান'}
      className={`w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-600 dark:text-slate-200 hover:scale-105 transition-transform ${className}`}
    >
      {mode === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
};

export default ThemeToggle;
