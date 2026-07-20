import { baseApi } from '../../api/baseApi';

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTransactions: builder.query({
      query: (params) => ({ url: '/transactions', params }),
      providesTags: (result) =>
        result?.data?.transactions
          ? [
              ...result.data.transactions.map((t) => ({ type: 'Transaction', id: t._id })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),
    getTransactionById: builder.query({
      query: (id) => `/transactions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
    }),
    createTransaction: builder.mutation({
      query: (body) => ({ url: '/transactions', method: 'POST', body }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),
    voidTransaction: builder.mutation({
      query: ({ id, reason }) => ({ url: `/transactions/${id}/void`, method: 'PATCH', body: { reason } }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),
    getMemberDuesById: builder.query({
      query: (memberId) => `/transactions/dues/${memberId}`,
    }),
  }),
});

export const {
  useGetAllTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useVoidTransactionMutation,
  useGetMemberDuesByIdQuery,
} = transactionApi;
