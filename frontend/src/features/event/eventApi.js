import { baseApi } from '../../api/baseApi';

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({ url: '/events', params }),
      providesTags: (result) =>
        result?.data?.events
          ? [...result.data.events.map((e) => ({ type: 'Event', id: e._id })), { type: 'Event', id: 'LIST' }]
          : [{ type: 'Event', id: 'LIST' }],
    }),
    getEventById: builder.query({
      query: (id) => `/events/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),
    registerForEvent: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/events/${id}/register`, method: 'POST', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Event', id }],
    }),
    unregisterFromEvent: builder.mutation({
      query: (id) => ({ url: `/events/${id}/register`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Event', id }],
    }),

    // -------- Admin/Staff mutations --------
    createEvent: builder.mutation({
      query: (formData) => ({ url: '/events', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }],
    }),
    updateEvent: builder.mutation({
      query: ({ id, formData }) => ({ url: `/events/${id}`, method: 'PATCH', body: formData }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Event', id }, { type: 'Event', id: 'LIST' }],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({ url: `/events/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }],
    }),
    getEventAttendance: builder.query({
      query: (id) => `/events/${id}/attendance`,
      providesTags: (result, error, id) => [{ type: 'Event', id: `attendance-${id}` }],
    }),
    markEventAttendance: builder.mutation({
      query: ({ id, qrCode }) => ({ url: `/events/${id}/attendance`, method: 'POST', body: { qrCode } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Event', id: `attendance-${id}` }],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useRegisterForEventMutation,
  useUnregisterFromEventMutation,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetEventAttendanceQuery,
  useMarkEventAttendanceMutation,
} = eventApi;
