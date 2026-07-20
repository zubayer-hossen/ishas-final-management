import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useNotificationSocket from '../../hooks/useNotificationSocket';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useNotificationSocket();

  return (
    <div className="min-h-screen lg:flex bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="px-4 sm:px-6 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
