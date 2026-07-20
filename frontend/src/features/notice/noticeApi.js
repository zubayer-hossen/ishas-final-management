import { baseApi } from '../../api/baseApi';

export const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotices: builder.query({
      query: (params) => ({ url: '/notices', params }),
      providesTags: (result) =>
        result?.data?.notices
          ? [
              ...result.data.notices.map((n) => ({ type: 'Notice', id: n._id })),
              { type: 'Notice', id: 'LIST' },
            ]
          : [{ type: 'Notice', id: 'LIST' }],
    }),
    getNoticeById: builder.query({
      query: (id) => `/notices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Notice', id }],
    }),
    createNotice: builder.mutation({
      query: (formData) => ({ url: '/notices', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'Notice', id: 'LIST' }],
    }),
    toggleNoticePin: builder.mutation({
      query: (id) => ({ url: `/notices/${id}/pin`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'Notice', id: 'LIST' }],
    }),
    deleteNotice: builder.mutation({
      query: (id) => ({ url: `/notices/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Notice', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useCreateNoticeMutation,
  useToggleNoticePinMutation,
  useDeleteNoticeMutation,
} = noticeApi;
