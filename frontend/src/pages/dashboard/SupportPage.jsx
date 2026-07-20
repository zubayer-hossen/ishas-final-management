import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiChevronDown } from 'react-icons/fi';
import { useGetFaqsQuery, useGetMyTicketsQuery, useCreateTicketMutation } from '../../features/support/supportApi';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';

const CATEGORY_OPTIONS = [
  { value: 'complaint', label: 'অভিযোগ' },
  { value: 'suggestion', label: 'পরামর্শ' },
  { value: 'feedback', label: 'মতামত' },
  { value: 'technical', label: 'কারিগরি' },
  { value: 'financial', label: 'আর্থিক' },
  { value: 'other', label: 'অন্যান্য' },
];

const STATUS_LABELS = {
  open: { label: 'খোলা', className: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' },
  in_progress: { label: 'প্রক্রিয়াধীন', className: 'bg-warning/15 text-warning' },
  resolved: { label: 'সমাধান হয়েছে', className: 'bg-success/15 text-success' },
  closed: { label: 'বন্ধ', className: 'bg-slate-100 dark:bg-slate-800 text-slate-400' },
};

const SupportPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const { data: faqData } = useGetFaqsQuery();
  const { data: ticketData } = useGetMyTicketsQuery();
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const faqs = faqData?.data || [];
  const tickets = ticketData?.data?.tickets || [];

  const onSubmit = async (formData) => {
    try {
      await createTicket(formData).unwrap();
      toast.success('টিকেট জমা দেওয়া হয়েছে');
      reset();
    } catch (err) {
      toast.error(err?.data?.message || 'টিকেট জমা দেওয়া ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-6 space-y-8">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">সাপোর্ট সেন্টার</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-4 h-fit">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">নতুন টিকেট তৈরি করুন</h2>

          <TextInput
            label="বিষয়"
            error={errors.subject?.message}
            {...register('subject', { required: 'বিষয় আবশ্যক' })}
          />

          <div>
            <label className="field-label">ক্যাটাগরি</label>
            <select className="input-field" {...register('category')}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">বিস্তারিত</label>
            <textarea
              className="input-field min-h-28"
              {...register('description', { required: 'বিস্তারিত আবশ্যক' })}
            />
            {errors.description && <p className="field-error">{errors.description.message}</p>}
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            জমা দিন
          </Button>
        </form>

        <div className="space-y-3">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">আমার টিকেট</h2>
          {tickets.length === 0 && <p className="text-sm text-slate-400">কোনো টিকেট নেই</p>}
          {tickets.map((t) => {
            const s = STATUS_LABELS[t.status] || STATUS_LABELS.open;
            return (
              <Link
                key={t._id}
                to={`/dashboard/support/tickets/${t._id}`}
                className="glass-card p-4 flex items-center justify-between gap-3 block"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{t.subject}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.ticketNumber}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${s.className}`}>
                  {s.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">সাধারণ জিজ্ঞাসা (FAQ)</h2>
        <div className="space-y-2">
          {faqs.map((faq) => (
            <div key={faq._id} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === faq._id ? null : faq._id)}
                className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                {faq.question}
                <FiChevronDown className={`transition-transform ${openFaq === faq._id ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === faq._id && (
                <p className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
