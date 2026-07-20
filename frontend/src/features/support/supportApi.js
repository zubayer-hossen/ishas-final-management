import { baseApi } from '../../api/baseApi';

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyTickets: builder.query({
      query: (params) => ({ url: '/support/tickets/my', params }),
      providesTags: [{ type: 'Ticket', id: 'LIST' }],
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
    getFaqs: builder.query({
      query: () => '/support/faqs',
      providesTags: [{ type: 'Faq', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetMyTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useAddTicketReplyMutation,
  useGetFaqsQuery,
} = supportApi;
