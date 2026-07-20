import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { createApi } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { setCredentials, logout } from '../features/auth/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Prevents multiple simultaneous refresh-token requests when several
// queries fail with 401 at the same time.
const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include', // send the httpOnly refreshToken cookie
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

/**
 * Wraps the base query: on a 401 response, attempts a single token
 * refresh (guarded by a mutex so concurrent requests don't all refresh
 * at once), then retries the original request. Logs the user out if
 * the refresh itself fails.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await rawBaseQuery(
          { url: '/auth/refresh-token', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data?.data?.accessToken) {
          api.dispatch(setCredentials({ accessToken: refreshResult.data.data.accessToken }));
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Member',
    'Committee',
    'Transaction',
    'Notice',
    'Event',
    'Blog',
    'Album',
    'Meeting',
    'Ticket',
    'Faq',
    'Notification',
    'Settings',
  ],
  endpoints: () => ({}),
});
