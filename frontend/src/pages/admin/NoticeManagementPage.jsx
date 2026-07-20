import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiTrash2, FiStar } from 'react-icons/fi';
import {
  useGetNoticesQuery,
  useCreateNoticeMutation,
  useToggleNoticePinMutation,
  useDeleteNoticeMutation,
} from '../../features/notice/noticeApi';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/ui/Spinner';

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'সাধারণ' },
  { value: 'meeting', label: 'মিটিং' },
  { value: 'financial', label: 'আর্থিক' },
  { value: 'event', label: 'ইভেন্ট' },
  { value: 'urgent', label: 'জরুরি' },
  { value: 'other', label: 'অন্যান্য' },
];

const ComposeNoticeForm = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { category: 'general' } });
  const [createNotice, { isLoading }] = useCreateNoticeMutation();

  const onSubmit = async (formData) => {
    try {
      await createNotice(formData).unwrap();
      toast.success('নোটিশ প্রকাশ করা হয়েছে');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'নোটিশ প্রকাশ ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-lg space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">নতুন নোটিশ প্রকাশ করুন</h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <FiX size={18} />
          </button>
        </div>

        <TextInput
          label="শিরোনাম"
          error={errors.title?.message}
          {...register('title', { required: 'শিরোনাম আবশ্যক' })}
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
            className="input-field min-h-32"
            {...register('content', { required: 'বিস্তারিত আবশ্যক' })}
          />
          {errors.content && <p className="field-error">{errors.content.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" className="rounded border-slate-300" {...register('sendEmailNotification')} />
          সদস্যদের ইমেইলেও পাঠান
        </label>

        <Button type="submit" isLoading={isLoading} className="w-full">
          প্রকাশ করুন
        </Button>
      </form>
    </div>
  );
};

const NoticeManagementPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useGetNoticesQuery({ limit: 50 });
  const [togglePin] = useToggleNoticePinMutation();
  const [deleteNotice] = useDeleteNoticeMutation();

  const notices = data?.data?.notices || [];

  const handleDelete = async (id) => {
    try {
      await deleteNotice(id).unwrap();
      toast.success('নোটিশ মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'মুছে ফেলা ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">নোটিশ পরিচালনা</h1>
        <Button className="!py-2 text-sm" onClick={() => setShowForm(true)}>
          <FiPlus size={15} /> নতুন নোটিশ
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice._id} className="glass-card p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {notice.isPinned && (
                    <span className="text-[10px] font-bold bg-warning/15 text-warning px-2 py-0.5 rounded-full">পিন করা</span>
                  )}
                  <span className="text-[10px] text-slate-400">{new Date(notice.createdAt).toLocaleDateString('bn-BD')}</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-white">{notice.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{notice.content}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => togglePin(notice._id)}
                  className={notice.isPinned ? 'text-warning' : 'text-slate-400 hover:text-warning'}
                  title="পিন/আনপিন"
                >
                  <FiStar size={16} />
                </button>
                <button onClick={() => handleDelete(notice._id)} className="text-danger/70 hover:text-danger" title="মুছুন">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {notices.length === 0 && <div className="glass-card p-10 text-center text-slate-400">কোনো নোটিশ নেই</div>}
        </div>
      )}

      {showForm && <ComposeNoticeForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default NoticeManagementPage;
