import { baseApi } from '../../api/baseApi';

export const meetingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeetings: builder.query({
      query: (params) => ({ url: '/meetings', params }),
      providesTags: (result) =>
        result?.data?.meetings
          ? [...result.data.meetings.map((m) => ({ type: 'Meeting', id: m._id })), { type: 'Meeting', id: 'LIST' }]
          : [{ type: 'Meeting', id: 'LIST' }],
    }),
    getMeetingById: builder.query({
      query: (id) => `/meetings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Meeting', id }],
    }),
    verifyJoin: builder.mutation({
      query: ({ id, password }) => ({ url: `/meetings/${id}/verify-join`, method: 'POST', body: { password } }),
    }),
  }),
});

export const { useGetMeetingsQuery, useGetMeetingByIdQuery, useVerifyJoinMutation } = meetingApi;
