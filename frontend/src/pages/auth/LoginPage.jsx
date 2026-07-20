import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import TextInput from '../../components/ui/TextInput';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import { useLoginMutation } from '../../features/auth/authApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from '../../features/auth/authSlice';

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (formData) => {
    try {
      const result = await login(formData).unwrap();
      dispatch(setCredentials({ user: result.data.user, accessToken: result.data.accessToken }));
      toast.success(result.message || 'লগইন সফল হয়েছে');
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      const message = err?.data?.message || 'লগইন ব্যর্থ হয়েছে, আবার চেষ্টা করুন';
      toast.error(message);

      if (message.includes('ভেরিফাই')) {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      }
    }
  };

  return (
    <AuthLayout title="স্বাগতম" subtitle="আপনার একাউন্টে লগইন করুন">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

        <PasswordInput
          label="পাসওয়ার্ড"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { required: 'পাসওয়ার্ড আবশ্যক' })}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300" {...register('rememberMe')} />
            মনে রাখুন
          </label>
          <Link to="/forgot-password" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          লগইন করুন
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        নতুন সদস্য?{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
          রেজিস্ট্রেশন করুন
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
