import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiTrash2, FiEdit2, FiEyeOff, FiEye } from 'react-icons/fi';
import {
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} from '../../features/banner/bannerApi';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/ui/Spinner';

const BannerForm = ({ banner, onClose }) => {
  const isEdit = !!banner;
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: banner
      ? {
          title: banner.title,
          subtitle: banner.subtitle,
          buttonText: banner.buttonText,
          linkUrl: banner.linkUrl,
          order: banner.order,
          isActive: banner.isActive,
        }
      : { order: 0, isActive: true },
  });
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  const onSubmit = async (formData) => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'image') {
        if (value?.[0]) fd.append('image', value[0]);
      } else if (value !== '' && value !== undefined) {
        fd.append(key, value);
      }
    });

    if (!isEdit && !formData.image?.[0]) {
      toast.error('ব্যানারের ছবি আবশ্যক');
      return;
    }

    try {
      if (isEdit) {
        await updateBanner({ id: banner._id, formData: fd }).unwrap();
        toast.success('ব্যানার আপডেট হয়েছে');
      } else {
        await createBanner(fd).unwrap();
        toast.success('ব্যানার তৈরি করা হয়েছে');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">{isEdit ? 'ব্যানার সম্পাদনা' : 'নতুন ব্যানার'}</h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <FiX size={18} />
          </button>
        </div>

        {banner?.image?.url && (
          <img src={banner.image.url} alt={banner.title} className="w-full aspect-[21/9] object-cover rounded-lg" />
        )}

        <div>
          <label className="field-label">ব্যানারের ছবি {isEdit ? '(পরিবর্তন করতে চাইলে দিন)' : ''}</label>
          <input type="file" accept="image/*" className="input-field" {...register('image')} />
          <p className="text-[11px] text-slate-400 mt-1">প্রস্তাবিত অনুপাত: 21:9 (যেমন 1600×685px)</p>
        </div>

        <TextInput label="শিরোনাম" error={errors.title?.message} {...register('title', { required: 'শিরোনাম আবশ্যক' })} />
        <TextInput label="সাবটাইটেল (ঐচ্ছিক)" {...register('subtitle')} />

        <div className="grid grid-cols-2 gap-3">
          <TextInput label="বাটনের লেখা (ঐচ্ছিক)" placeholder="যেমন: সদস্য হন" {...register('buttonText')} />
          <TextInput label="বাটনের লিংক (ঐচ্ছিক)" placeholder="/register" {...register('linkUrl')} />
        </div>

        <div className="grid grid-cols-2 gap-3 items-end">
          <TextInput label="ক্রম (Order)" type="number" {...register('order')} />
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer pb-3">
            <input type="checkbox" className="rounded border-slate-300" {...register('isActive')} />
            সক্রিয় (হোমপেজে দেখাবে)
          </label>
        </div>

        <Button type="submit" isLoading={isCreating || isUpdating} className="w-full">
          সংরক্ষণ করুন
        </Button>
      </form>
    </div>
  );
};

const BannerManagementPage = () => {
  const { data, isLoading } = useGetAdminBannersQuery();
  const [deleteBanner] = useDeleteBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [formBanner, setFormBanner] = useState(undefined);

  const banners = data?.data || [];

  const handleDelete = async (id) => {
    if (!window.confirm('এই ব্যানারটি মুছে ফেলতে চান?')) return;
    try {
      await deleteBanner(id).unwrap();
      toast.success('ব্যানার মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'মুছে ফেলা ব্যর্থ হয়েছে');
    }
  };

  const toggleActive = async (banner) => {
    const fd = new FormData();
    fd.append('isActive', String(!banner.isActive));
    try {
      await updateBanner({ id: banner._id, formData: fd }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || 'আপডেট ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">ব্যানার পরিচালনা</h1>
          <p className="text-xs text-slate-400 mt-1">হোমপেজের স্লাইডারে দেখানো ব্যানার এখান থেকে নিয়ন্ত্রণ করুন</p>
        </div>
        <Button className="!py-2 text-sm" onClick={() => setFormBanner(null)}>
          <FiPlus size={15} /> নতুন ব্যানার
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner._id} className="glass-card p-4 flex items-center gap-4">
              <img
                src={banner.image?.url}
                alt={banner.title}
                className="w-28 h-16 object-cover rounded-lg shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800 dark:text-white truncate">{banner.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">ক্রম: {banner.order}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                  banner.isActive ? 'bg-success/15 text-success' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {banner.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => toggleActive(banner)}
                  className="text-slate-500 hover:text-primary-600"
                  title={banner.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                >
                  {banner.isActive ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
                <button onClick={() => setFormBanner(banner)} className="text-slate-500 hover:text-primary-600" title="সম্পাদনা">
                  <FiEdit2 size={15} />
                </button>
                <button onClick={() => handleDelete(banner._id)} className="text-danger/70 hover:text-danger" title="মুছুন">
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {banners.length === 0 && <div className="glass-card p-10 text-center text-slate-400">কোনো ব্যানার নেই</div>}
        </div>
      )}

      {formBanner !== undefined && <BannerForm banner={formBanner} onClose={() => setFormBanner(undefined)} />}
    </div>
  );
};

export default BannerManagementPage;
