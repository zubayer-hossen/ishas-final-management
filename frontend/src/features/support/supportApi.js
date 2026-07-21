import { baseApi } from '../../api/baseApi';

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyTickets: builder.query({
      query: (params) => ({ url: '/support/tickets/my', params }),
      providesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),
    getAllTickets: builder.query({
      query: (params) => ({ url: '/support/tickets', params }),
      providesTags: (result) =>
        result?.data?.tickets
          ? [...result.data.tickets.map((t) => ({ type: 'Ticket', id: t._id })), { type: 'Ticket', id: 'LIST' }]
          : [{ type: 'Ticket', id: 'LIST' }],
    }),
    getTicketById: builder.query({
      query: (id) => `/support/tickets/${id}`,
      providesTags: (result, error, id) => [{ type: 'Ticket', id }],
    }),
    createTicket: builder.mutation({
      query: (body) => ({ url: '/support/tickets', method: 'POST', body }),
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),
    addTicketReply: builder.mutation({
      query: ({ id, message }) => ({ url: `/support/tickets/${id}/replies`, method: 'POST', body: { message } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ticket', id }],
    }),
    updateTicketStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/support/tickets/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ticket', id }, { type: 'Ticket', id: 'LIST' }],
    }),
    getFaqs: builder.query({
      query: () => '/support/faqs',
      providesTags: [{ type: 'Faq', id: 'LIST' }],
    }),
    createFaq: builder.mutation({
      query: (body) => ({ url: '/support/faqs', method: 'POST', body }),
      invalidatesTags: [{ type: 'Faq', id: 'LIST' }],
    }),
    deleteFaq: builder.mutation({
      query: (id) => ({ url: `/support/faqs/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Faq', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetMyTicketsQuery,
  useGetAllTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useAddTicketReplyMutation,
  useUpdateTicketStatusMutation,
  useGetFaqsQuery,
  useCreateFaqMutation,
  useDeleteFaqMutation,
} = supportApi;
