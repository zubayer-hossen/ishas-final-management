import { baseApi } from '../../api/baseApi';

export const memberApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateMyProfile: builder.mutation({
      query: (body) => ({ url: '/members/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    uploadProfilePicture: builder.mutation({
      query: (formData) => ({ url: '/members/me/profile-picture', method: 'POST', body: formData }),
      invalidatesTags: ['User'],
    }),
    getMyDues: builder.query({
      query: () => '/transactions/dues/me',
      providesTags: ['Transaction'],
    }),

    // -------- Staff / Admin endpoints --------
    getAllMembers: builder.query({
      query: (params) => ({ url: '/members', params }),
      providesTags: (result) =>
        result?.data?.members
          ? [...result.data.members.map((m) => ({ type: 'Member', id: m._id })), { type: 'Member', id: 'LIST' }]
          : [{ type: 'Member', id: 'LIST' }],
    }),
    approveMember: builder.mutation({
      query: (id) => ({ url: `/members/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }],
    }),
    rejectMember: builder.mutation({
      query: ({ id, reason }) => ({ url: `/members/${id}/reject`, method: 'PATCH', body: { reason } }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }],
    }),
    updateMemberRole: builder.mutation({
      query: ({ id, role }) => ({ url: `/members/${id}/role`, method: 'PATCH', body: { role } }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }],
    }),
    updateMemberStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/members/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }],
    }),
  }),
});

export const {
  useUpdateMyProfileMutation,
  useUploadProfilePictureMutation,
  useGetMyDuesQuery,
  useGetAllMembersQuery,
  useApproveMemberMutation,
  useRejectMemberMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberStatusMutation,
} = memberApi;
