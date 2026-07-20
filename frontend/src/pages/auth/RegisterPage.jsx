import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import TextInput from '../../components/ui/TextInput';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import { useRegisterMutation } from '../../features/auth/authApi';

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [registerUser, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async ({ confirmPassword, ...formData }) => {
    try {
      const result = await registerUser(formData).unwrap();
      toast.success(result.message || 'রেজিস্ট্রেশন সফল হয়েছে');
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      toast.error(err?.data?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    }
  };

  return (
    <AuthLayout title="সদস্য হিসেবে যোগ দিন" subtitle="একটি নতুন একাউন্ট তৈরি করুন">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextInput
          label="পূর্ণ নাম"
          placeholder="আপনার নাম লিখুন"
          error={errors.fullName?.message}
          {...register('fullName', { required: 'নাম আবশ্যক', maxLength: { value: 100, message: 'নাম অনেক বড়' } })}
        />

        <TextInput
          label="ইমেইল"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'ইমেইল আবশ্যক',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'সঠিক ইমেইল দিন' },
          })}
        />

        <TextInput
          label="ফোন নম্বর (ঐচ্ছিক)"
          type="tel"
          placeholder="01XXXXXXXXX"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <PasswordInput
          label="পাসওয়ার্ড"
          placeholder="কমপক্ষে ৮ ক্যারেক্টার, ১টি সংখ্যা সহ"
          error={errors.password?.message}
          {...register('password', {
            required: 'পাসওয়ার্ড আবশ্যক',
            minLength: { value: 8, message: 'পাসওয়ার্ড কমপক্ষে ৮ ক্যারেক্টার হতে হবে' },
            pattern: { value: /\d/, message: 'পাসওয়ার্ডে অন্তত একটি সংখ্যা থাকতে হবে' },
          })}
        />

        <PasswordInput
          label="পাসওয়ার্ড নিশ্চিত করুন"
          placeholder="আবার পাসওয়ার্ড লিখুন"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'পাসওয়ার্ড নিশ্চিত করুন',
            validate: (value) => value === password || 'পাসওয়ার্ড মিলছে না',
          })}
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          রেজিস্ট্রেশন করুন
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        ইতিমধ্যে একাউন্ট আছে?{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
          লগইন করুন
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
