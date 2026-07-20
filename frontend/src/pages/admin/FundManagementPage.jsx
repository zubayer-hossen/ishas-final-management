import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiDownload, FiSlash } from 'react-icons/fi';
import {
  useGetAllTransactionsQuery,
  useCreateTransactionMutation,
  useVoidTransactionMutation,
} from '../../features/transaction/transactionApi';
import { useGetAllMembersQuery } from '../../features/member/memberApi';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/ui/Spinner';
import { toBanglaDigits } from '../../utils/banglaDigits';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const CATEGORY_LABELS = {
  monthly_chada: 'মাসিক চাঁদা',
  donation: 'অনুদান',
  emergency_fund: 'জরুরি তহবিল',
  special_fund: 'বিশেষ তহবিল',
  other_income: 'অন্যান্য আয়',
  expense: 'খরচ',
};

const INCOME_CATEGORIES = ['monthly_chada', 'donation', 'emergency_fund', 'special_fund', 'other_income'];
const PAYMENT_METHODS = ['cash', 'bkash', 'nagad', 'rocket', 'bank', 'other'];

const TransactionForm = ({ onClose }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'income', category: 'monthly_chada', paymentMethod: 'cash' },
  });
  const [createTransaction, { isLoading }] = useCreateTransactionMutation();
  const { data: membersData } = useGetAllMembersQuery({ membershipStatus: 'active', limit: 500 });

  const type = watch('type');
  const category = watch('category');
  const members = membersData?.data?.members || [];

  const onSubmit = async (formData) => {
    try {
      const payload = { ...formData };
      if (!payload.memberId) delete payload.memberId;
      if (payload.category !== 'monthly_chada') delete payload.month;
      await createTransaction(payload).unwrap();
      toast.success('লেনদেন রেকর্ড করা হয়েছে');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'লেনদেন রেকর্ড ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">নতুন লেনদেন যুক্ত করুন</h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <FiX size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">ধরন</label>
            <select className="input-field" {...register('type')}>
              <option value="income">আয়</option>
              <option value="expense">ব্যয়</option>
            </select>
          </div>
          <div>
            <label className="field-label">ক্যাটাগরি</label>
            <select className="input-field" {...register('category')}>
              {type === 'income'
                ? INCOME_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))
                : (
                  <option value="expense">{CATEGORY_LABELS.expense}</option>
                )}
            </select>
          </div>
        </div>

        {type === 'income' && (
          <div>
            <label className="field-label">সদস্য (ঐচ্ছিক)</label>
            <select className="input-field" {...register('memberId')}>
              <option value="">নির্বাচন করুন</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.fullName} ({m.memberId})
                </option>
              ))}
            </select>
          </div>
        )}

        {category === 'monthly_chada' && (
          <TextInput label="মাস (YYYY-MM)" placeholder="2026-07" {...register('month', { required: true })} />
        )}

        <TextInput
          label="পরিমাণ"
          type="number"
          step="0.01"
          error={errors.amount?.message}
          {...register('amount', { required: 'পরিমাণ আবশ্যক', min: { value: 1, message: 'সঠিক পরিমাণ দিন' } })}
        />

        <div>
          <label className="field-label">পেমেন্ট মাধ্যম</label>
          <select className="input-field" {...register('paymentMethod')}>
            {PAYMENT_METHODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <TextInput label="বিবরণ / উদ্দেশ্য (ঐচ্ছিক)" {...register(type === 'expense' ? 'purpose' : 'description')} />

        <Button type="submit" isLoading={isLoading} className="w-full">
          সংরক্ষণ করুন
        </Button>
      </form>
    </div>
  );
};

const FundManagementPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const { data, isLoading } = useGetAllTransactionsQuery({ type: typeFilter || undefined, limit: 50 });
  const [voidTransaction] = useVoidTransactionMutation();

  const transactions = data?.data?.transactions || [];
  const summary = data?.data?.summary || { income: 0, expense: 0, balance: 0 };

  const handleVoid = async (id) => {
    const reason = window.prompt('বাতিলের কারণ লিখুন (ঐচ্ছিক):') || '';
    try {
      await voidTransaction({ id, reason }).unwrap();
      toast.success('লেনদেন বাতিল করা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'বাতিল ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">তহবিল ব্যবস্থাপনা</h1>
        <Button className="!py-2 text-sm" onClick={() => setShowForm(true)}>
          <FiPlus size={15} /> নতুন লেনদেন
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">মোট আয়</p>
          <p className="text-2xl font-data font-bold text-success mt-1">৳{toBanglaDigits(summary.income)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">মোট ব্যয়</p>
          <p className="text-2xl font-data font-bold text-danger mt-1">৳{toBanglaDigits(summary.expense)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">ব্যালেন্স</p>
          <p className="text-2xl font-data font-bold text-primary-600 mt-1">৳{toBanglaDigits(summary.balance)}</p>
        </div>
      </div>

      <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field sm:w-52">
        <option value="">সব ধরন</option>
        <option value="income">আয়</option>
        <option value="expense">ব্যয়</option>
      </select>

      {isLoading ? (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-medium">রশিদ নম্বর</th>
                <th className="p-4 font-medium">ক্যাটাগরি</th>
                <th className="p-4 font-medium">সদস্য</th>
                <th className="p-4 font-medium">পরিমাণ</th>
                <th className="p-4 font-medium">তারিখ</th>
                <th className="p-4 font-medium text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="p-4 font-data text-xs">{t.transactionId}</td>
                  <td className="p-4">{CATEGORY_LABELS[t.category] || t.category}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{t.member?.fullName || '-'}</td>
                  <td className={`p-4 font-data font-semibold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'income' ? '+' : '-'}৳{toBanglaDigits(t.amount)}
                  </td>
                  <td className="p-4 text-xs text-slate-400">{new Date(t.date).toLocaleDateString('bn-BD')}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      {t.type === 'income' && (
                        <a
                          href={`${API_BASE_URL}/transactions/${t._id}/receipt`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 dark:text-primary-400"
                          title="রশিদ ডাউনলোড"
                        >
                          <FiDownload size={15} />
                        </a>
                      )}
                      {!t.isVoided && (
                        <button onClick={() => handleVoid(t._id)} className="text-danger/70 hover:text-danger" title="বাতিল করুন">
                          <FiSlash size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <p className="text-center text-slate-400 py-10">কোনো লেনদেন নেই</p>}
        </div>
      )}

      {showForm && <TransactionForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default FundManagementPage;
