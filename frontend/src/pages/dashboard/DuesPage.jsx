import { useGetMyDuesQuery } from '../../features/member/memberApi';
import Spinner from '../../components/ui/Spinner';
import { toBanglaDigits as toBn } from '../../utils/banglaDigits';

const DuesPage = () => {
  const { data, isLoading } = useGetMyDuesQuery();
  const dues = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner size={28} className="text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-6 space-y-6">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">চাঁদা ও বকেয়া</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">মোট বকেয়া</p>
          <p className="text-2xl font-data font-bold text-danger mt-1">{toBn(dues?.totalDue ?? 0)} টাকা</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">মাসিক চাঁদা</p>
          <p className="text-2xl font-data font-bold text-slate-800 dark:text-white mt-1">
            {toBn(dues?.monthlyAmount ?? 0)} টাকা
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">মোট পরিশোধিত</p>
          <p className="text-2xl font-data font-bold text-success mt-1">{toBn(dues?.totalPaid ?? 0)} টাকা</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">পরিশোধিত মাস</h2>
          {dues?.paidMonths?.length ? (
            <div className="flex flex-wrap gap-2">
              {dues.paidMonths.map((m) => (
                <span
                  key={m}
                  className="text-xs font-data bg-success/10 text-success px-2.5 py-1 rounded-full"
                >
                  {toBn(m)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">এখনো কোনো মাসের চাঁদা পরিশোধ হয়নি</p>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">বকেয়া মাস</h2>
          {dues?.dueMonths?.length ? (
            <div className="flex flex-wrap gap-2">
              {dues.dueMonths.map((m) => (
                <span key={m} className="text-xs font-data bg-danger/10 text-danger px-2.5 py-1 rounded-full">
                  {toBn(m)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">কোনো বকেয়া নেই 🎉</p>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        চাঁদা পরিশোধের জন্য অনুগ্রহ করে কোষাধ্যক্ষ অথবা সংশ্লিষ্ট কমিটির সাথে যোগাযোগ করুন।
      </p>
    </div>
  );
};

export default DuesPage;
