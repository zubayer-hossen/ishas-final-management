import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import OtpInput from '../../components/ui/OtpInput';
import Button from '../../components/ui/Button';
import { useVerifyOtpMutation, useResendOtpMutation } from '../../features/auth/authApi';

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(
    async (e) => {
      e.preventDefault();
      if (otp.length !== 6) {
        toast.error('৬ সংখ্যার OTP দিন');
        return;
      }
      try {
        const result = await verifyOtp({ email, otp }).unwrap();
        toast.success(result.message || 'ইমেইল ভেরিফাই হয়েছে');
        navigate('/login');
      } catch (err) {
        toast.error(err?.data?.message || 'OTP যাচাই ব্যর্থ হয়েছে');
      }
    },
    [otp, email, verifyOtp, navigate]
  );

  const handleResend = async () => {
    try {
      const result = await resendOtp({ email }).unwrap();
      toast.success(result.message || 'নতুন OTP পাঠানো হয়েছে');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err?.data?.message || 'OTP পুনরায় পাঠানো ব্যর্থ হয়েছে');
    }
  };

  return (
    <AuthLayout title="ইমেইল ভেরিফাই করুন" subtitle={email ? `${email} ঠিকানায় পাঠানো কোডটি দিন` : 'আপনার ইমেইলে পাঠানো কোডটি দিন'}>
      <form onSubmit={handleVerify} className="space-y-6">
        <OtpInput value={otp} onChange={setOtp} />

        <Button type="submit" isLoading={isVerifying} className="w-full">
          ভেরিফাই করুন
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        কোড পাননি?{' '}
        {cooldown > 0 ? (
          <span>আবার পাঠাতে {cooldown} সেকেন্ড অপেক্ষা করুন</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline disabled:opacity-60"
          >
            আবার পাঠান
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:underline">
          লগইন পেজে ফিরে যান
        </Link>
      </p>
    </AuthLayout>
  );
};

export default VerifyOtpPage;
