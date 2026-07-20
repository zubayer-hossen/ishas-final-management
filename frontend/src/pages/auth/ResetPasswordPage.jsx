import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import { useResetPasswordMutation } from '../../features/auth/authApi';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async ({ password: newPassword }) => {
    if (!token || !email) {
      toast.error('অবৈধ অথবা মেয়াদোত্তীর্ণ লিংক');
      return;
    }
    try {
      const result = await resetPassword({ email, token, password: newPassword }).unwrap();
      toast.success(result.message || 'পাসওয়ার্ড পরিবর্তন হয়েছে');
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে');
    }
  };

  if (!token || !email) {
    return (
      <AuthLayout title="অবৈধ লিংক" subtitle="এই পাসওয়ার্ড রিসেট লিংকটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে">
        <Link to="/forgot-password" className="btn-gradient w-full flex justify-center">
          নতুন লিংক নিন
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="নতুন পাসওয়ার্ড সেট করুন" subtitle={email}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordInput
          label="নতুন পাসওয়ার্ড"
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
          পাসওয়ার্ড পরিবর্তন করুন
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
