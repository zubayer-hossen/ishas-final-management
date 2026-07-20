import { baseApi } from '../../api/baseApi';

export const committeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommittees: builder.query({
      query: (params) => ({ url: '/committees', params }),
      providesTags: (result) =>
        result?.data?.committees
          ? [...result.data.committees.map((c) => ({ type: 'Committee', id: c._id })), { type: 'Committee', id: 'LIST' }]
          : [{ type: 'Committee', id: 'LIST' }],
    }),
    getCommitteeById: builder.query({
      query: (id) => `/committees/${id}`,
      providesTags: (result, error, id) => [{ type: 'Committee', id }],
    }),
    createCommittee: builder.mutation({
      query: (body) => ({ url: '/committees', method: 'POST', body }),
      invalidatesTags: [{ type: 'Committee', id: 'LIST' }],
    }),
    updateCommittee: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/committees/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Committee', id }, { type: 'Committee', id: 'LIST' }],
    }),
    deleteCommittee: builder.mutation({
      query: (id) => ({ url: `/committees/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Committee', id: 'LIST' }],
    }),
    addCommitteeMember: builder.mutation({
      query: ({ id, userId, position }) => ({
        url: `/committees/${id}/members`,
        method: 'POST',
        body: { userId, position },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Committee', id }],
    }),
    removeCommitteeMember: builder.mutation({
      query: ({ id, memberEntryId }) => ({
        url: `/committees/${id}/members/${memberEntryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Committee', id }],
    }),
  }),
});

export const {
  useGetCommitteesQuery,
  useGetCommitteeByIdQuery,
  useCreateCommitteeMutation,
  useUpdateCommitteeMutation,
  useDeleteCommitteeMutation,
  useAddCommitteeMemberMutation,
  useRemoveCommitteeMemberMutation,
} = committeeApi;
