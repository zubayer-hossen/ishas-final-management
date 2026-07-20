import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateUser } from '../../features/auth/authSlice';
import { useUpdateMyProfileMutation, useUploadProfilePictureMutation } from '../../features/member/memberApi';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';

const ProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef(null);

  const [updateProfile, { isLoading: isSaving }] = useUpdateMyProfileMutation();
  const [uploadPicture, { isLoading: isUploading }] = useUploadProfilePictureMutation();

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        occupation: user.occupation,
        education: user.education,
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          phone: user.emergencyContact?.phone || '',
        },
      });
    }
  }, [user, reset]);

  const onSubmit = async (formData) => {
    try {
      const result = await updateProfile(formData).unwrap();
      dispatch(updateUser(result.data));
      toast.success('প্রোফাইল আপডেট হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const result = await uploadPicture(formData).unwrap();
      dispatch(updateUser({ profilePicture: result.data.profilePicture }));
      toast.success('প্রোফাইল ছবি আপডেট হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-6 space-y-6">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">প্রোফাইল</h1>

      <div className="glass-card p-6 flex items-center gap-5">
        <div className="relative">
          <img
            src={
              user?.profilePicture?.url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=4f46e5&color=fff`
            }
            alt={user?.fullName}
            className="w-20 h-20 rounded-2xl object-cover"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-brand text-white text-xs flex items-center justify-center shadow-glow"
          >
            ✎
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-semibold text-lg text-slate-800 dark:text-white">{user?.fullName}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <p className="text-xs text-slate-400 mt-1">সদস্য আইডি: {user?.memberId || 'N/A'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="পূর্ণ নাম" {...register('fullName')} />
          <TextInput label="ফোন নম্বর" {...register('phone')} />
          <TextInput label="রক্তের গ্রুপ" {...register('bloodGroup')} />
          <TextInput label="পেশা" {...register('occupation')} />
          <TextInput label="শিক্ষাগত যোগ্যতা" {...register('education')} className="sm:col-span-2" />
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">জরুরি যোগাযোগ</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="নাম" {...register('emergencyContact.name')} />
            <TextInput label="ফোন নম্বর" {...register('emergencyContact.phone')} />
          </div>
        </div>

        <Button type="submit" isLoading={isSaving}>
          পরিবর্তন সংরক্ষণ করুন
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
