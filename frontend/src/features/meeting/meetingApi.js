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

    // -------- Admin/Staff mutations --------
    createMeeting: builder.mutation({
      query: (body) => ({ url: '/meetings', method: 'POST', body }),
      invalidatesTags: [{ type: 'Meeting', id: 'LIST' }],
    }),
    updateMeeting: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/meetings/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Meeting', id }, { type: 'Meeting', id: 'LIST' }],
    }),
    cancelMeeting: builder.mutation({
      query: (id) => ({ url: `/meetings/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Meeting', id: 'LIST' }],
    }),
    getMeetingAttendance: builder.query({
      query: (id) => `/meetings/${id}/attendance`,
      providesTags: (result, error, id) => [{ type: 'Meeting', id: `attendance-${id}` }],
    }),
  }),
});

export const {
  useGetMeetingsQuery,
  useGetMeetingByIdQuery,
  useVerifyJoinMutation,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useCancelMeetingMutation,
  useGetMeetingAttendanceQuery,
} = meetingApi;
