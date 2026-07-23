import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useLogoutMutation } from '../../features/auth/authApi';
import { logout as logoutAction } from '../../features/auth/authSlice';

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // even if the server call fails, clear local session so the person isn't stuck
    }
    dispatch(logoutAction());
    toast.success('লগআউট সফল হয়েছে');
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 glass-card !py-1.5 !px-2 rounded-full"
        aria-label="ইউজার মেনু"
      >
        <img
          src={
            user?.profilePicture?.url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=4f46e5&color=fff`
          }
          alt={user?.fullName}
          className="w-7 h-7 rounded-full object-cover"
        />
        <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
          {user?.fullName}
        </span>
        <FiChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 glass-card !rounded-xl p-1.5 z-50">
          <Link
            to="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FiUser size={16} /> প্রোফাইল
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-danger/10"
          >
            <FiLogOut size={16} /> লগআউট
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
