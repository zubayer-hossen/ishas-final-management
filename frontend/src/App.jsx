import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppSelector } from './app/hooks';
import useAuthBootstrap from './hooks/useAuthBootstrap';
import AppRoutes from './routes/AppRoutes';

function App() {
  const themeMode = useAppSelector((state) => state.theme.mode);
  useAuthBootstrap();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'font-body text-sm',
          style: { borderRadius: '12px' },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;
