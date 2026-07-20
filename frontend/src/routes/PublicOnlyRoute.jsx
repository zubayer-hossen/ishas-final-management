import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

const PublicOnlyRoute = () => {
  const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);

  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
