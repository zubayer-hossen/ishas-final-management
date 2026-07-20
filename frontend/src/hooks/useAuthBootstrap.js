import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../app/hooks';
import { useRefreshTokenMutation, useLazyGetMeQuery } from '../features/auth/authApi';
import { setCredentials, logout } from '../features/auth/authSlice';

/**
 * Runs once when the app mounts. Since the access token only lives in
 * memory (Redux), a page refresh loses it — but the httpOnly refresh
 * token cookie is still valid, so we silently exchange it for a new
 * access token and re-fetch the current user.
 */
const useAuthBootstrap = () => {
  const dispatch = useAppDispatch();
  const [refreshToken] = useRefreshTokenMutation();
  const [getMe] = useLazyGetMeQuery();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    (async () => {
      try {
        const refreshResult = await refreshToken().unwrap();
        const accessToken = refreshResult?.data?.accessToken;
        if (!accessToken) throw new Error('NO_TOKEN');

        dispatch(setCredentials({ accessToken }));

        const meResult = await getMe().unwrap();
        dispatch(setCredentials({ user: meResult.data, accessToken }));
      } catch {
        dispatch(logout());
      }
    })();
  }, [dispatch, refreshToken, getMe]);
};

export default useAuthBootstrap;
