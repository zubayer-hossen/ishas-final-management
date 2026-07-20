import { baseApi } from '../../api/baseApi';

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAlbums: builder.query({
      query: (params) => ({ url: '/gallery/albums', params }),
      providesTags: (result) =>
        result?.data?.albums
          ? [...result.data.albums.map((a) => ({ type: 'Album', id: a._id })), { type: 'Album', id: 'LIST' }]
          : [{ type: 'Album', id: 'LIST' }],
    }),
    getAlbumById: builder.query({
      query: (id) => `/gallery/albums/${id}`,
      providesTags: (result, error, id) => [{ type: 'Album', id }],
    }),
    createAlbum: builder.mutation({
      query: (formData) => ({ url: '/gallery/albums', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'Album', id: 'LIST' }],
    }),
    addImagesToAlbum: builder.mutation({
      query: ({ id, formData }) => ({ url: `/gallery/albums/${id}/images`, method: 'POST', body: formData }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Album', id }],
    }),
    deleteImage: builder.mutation({
      query: ({ id, imageId }) => ({ url: `/gallery/albums/${id}/images/${imageId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Album', id }],
    }),
    deleteAlbum: builder.mutation({
      query: (id) => ({ url: `/gallery/albums/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Album', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAlbumsQuery,
  useGetAlbumByIdQuery,
  useCreateAlbumMutation,
  useAddImagesToAlbumMutation,
  useDeleteImageMutation,
  useDeleteAlbumMutation,
} = galleryApi;
