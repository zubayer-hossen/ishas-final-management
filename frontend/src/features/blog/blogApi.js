import { baseApi } from '../../api/baseApi';

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: (params) => ({ url: '/blogs', params }),
      providesTags: (result) =>
        result?.data?.blogs
          ? [...result.data.blogs.map((b) => ({ type: 'Blog', id: b._id })), { type: 'Blog', id: 'LIST' }]
          : [{ type: 'Blog', id: 'LIST' }],
    }),
    getBlogBySlug: builder.query({
      query: (slug) => `/blogs/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Blog', id: slug }],
    }),
    toggleBlogLike: builder.mutation({
      query: (id) => ({ url: `/blogs/${id}/like`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'Blog', id }],
    }),
    addBlogComment: builder.mutation({
      query: ({ id, text }) => ({ url: `/blogs/${id}/comments`, method: 'POST', body: { text } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }],
    }),

    // -------- Admin/Staff mutations --------
    createBlog: builder.mutation({
      query: (formData) => ({ url: '/blogs', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),
    updateBlog: builder.mutation({
      query: ({ id, formData }) => ({ url: `/blogs/${id}`, method: 'PATCH', body: formData }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, { type: 'Blog', id: 'LIST' }],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({ url: `/blogs/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogBySlugQuery,
  useToggleBlogLikeMutation,
  useAddBlogCommentMutation,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
