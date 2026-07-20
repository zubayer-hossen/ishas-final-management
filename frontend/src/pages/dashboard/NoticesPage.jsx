import { useState } from 'react';
import { FiPaperclip, FiChevronDown } from 'react-icons/fi';
import { useGetNoticesQuery } from '../../features/notice/noticeApi';
import Spinner from '../../components/ui/Spinner';

const CATEGORY_LABELS = {
  general: 'সাধারণ',
  meeting: 'মিটিং',
  financial: 'আর্থিক',
  event: 'ইভেন্ট',
  urgent: 'জরুরি',
  other: 'অন্যান্য',
};

const NoticesPage = () => {
  const { data, isLoading } = useGetNoticesQuery({ limit: 30 });
  const [expandedId, setExpandedId] = useState(null);

  const notices = data?.data?.notices || [];

  return (
    <div className="max-w-3xl mx-auto pt-6 space-y-4">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">নোটিশ</h1>

      {isLoading && (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      )}

      {!isLoading && notices.length === 0 && (
        <div className="glass-card p-10 text-center text-slate-400">কোনো নোটিশ নেই</div>
      )}

      {notices.map((notice) => {
        const isOpen = expandedId === notice._id;
        return (
          <div key={notice._id} className="glass-card overflow-hidden">
            <button
              onClick={() => setExpandedId(isOpen ? null : notice._id)}
              className="w-full flex items-start justify-between gap-3 p-5 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {notice.isPinned && (
                    <span className="text-[10px] font-bold bg-warning/15 text-warning px-2 py-0.5 rounded-full">
                      পিন করা
                    </span>
                  )}
                  <span className="text-[10px] font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 px-2 py-0.5 rounded-full">
                    {CATEGORY_LABELS[notice.category] || notice.category}
                  </span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-white">{notice.title}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(notice.createdAt).toLocaleDateString('bn-BD')}
                </p>
              </div>
              <FiChevronDown
                className={`shrink-0 mt-1 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {notice.content}

                {notice.attachments?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {notice.attachments.map((a, idx) => (
                      <a
                        key={idx}
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline text-xs"
                      >
                        <FiPaperclip size={13} /> {a.fileName || `সংযুক্তি ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NoticesPage;
