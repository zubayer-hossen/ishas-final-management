import { baseApi } from '../../api/baseApi';

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicBanners: builder.query({
      query: () => '/banners',
      providesTags: [{ type: 'Banner', id: 'LIST' }],
    }),
    getAdminBanners: builder.query({
      query: () => '/banners/admin',
      providesTags: [{ type: 'Banner', id: 'LIST' }],
    }),
    createBanner: builder.mutation({
      query: (formData) => ({ url: '/banners', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'Banner', id: 'LIST' }],
    }),
    updateBanner: builder.mutation({
      query: ({ id, formData }) => ({ url: `/banners/${id}`, method: 'PATCH', body: formData }),
      invalidatesTags: [{ type: 'Banner', id: 'LIST' }],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({ url: `/banners/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Banner', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPublicBannersQuery,
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
