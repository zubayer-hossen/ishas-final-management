import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../features/settings/settingsApi';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const OrgSettingsPage = () => {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const { register, handleSubmit, reset } = useForm();
  const settings = data?.data;

  useEffect(() => {
    if (settings) {
      reset({
        orgName: settings.orgName,
        currency: settings.currency,
        monthlyChadaAmount: settings.monthlyChadaAmount,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (formData) => {
    try {
      await updateSettings({
        ...formData,
        monthlyChadaAmount: Number(formData.monthlyChadaAmount),
      }).unwrap();
      toast.success('সেটিংস আপডেট করা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner size={28} className="text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pt-6 space-y-6">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">সংগঠনের সেটিংস</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-4">
        <TextInput label="সংগঠনের নাম" {...register('orgName', { required: true })} />
        <TextInput label="মুদ্রা" {...register('currency', { required: true })} />
        <TextInput
          label="মাসিক চাঁদার পরিমাণ"
          type="number"
          {...register('monthlyChadaAmount', { required: true, min: 0 })}
        />

        <Button type="submit" isLoading={isSaving} className="w-full">
          সংরক্ষণ করুন
        </Button>
      </form>

      <p className="text-xs text-slate-400 text-center">
        মাসিক চাঁদার পরিমাণ পরিবর্তন করলে তা শুধুমাত্র ভবিষ্যতের বকেয়ার হিসাবে প্রযোজ্য হবে।
      </p>
    </div>
  );
};

export default OrgSettingsPage;
