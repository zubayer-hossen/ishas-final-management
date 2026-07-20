import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { useForgotPasswordMutation } from '../../features/auth/authApi';

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (formData) => {
    try {
      const result = await forgotPassword(formData).unwrap();
      toast.success(result.message);
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.data?.message || 'কিছু একটা ভুল হয়েছে');
    }
  };

  return (
    <AuthLayout title="পাসওয়ার্ড ভুলে গেছেন?" subtitle="আপনার ইমেইল দিন, আমরা রিসেট লিংক পাঠাব">
      {submitted ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            যদি এই ইমেইলটি নিবন্ধিত থাকে, তাহলে একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। আপনার ইনবক্স চেক করুন।
          </p>
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            লগইন পেজে ফিরে যান
          </Link>
        </div>
      ) : (
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

          <Button type="submit" isLoading={isLoading} className="w-full">
            রিসেট লিংক পাঠান
          </Button>

          <p className="text-center text-sm">
            <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:underline">
              লগইন পেজে ফিরে যান
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
