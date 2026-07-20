import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiUser, FiLock } from 'react-icons/fi';
import { useGetMeetingsQuery, useVerifyJoinMutation } from '../../features/meeting/meetingApi';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/ui/Spinner';

const STATUS_LABELS = {
  scheduled: { label: 'নির্ধারিত', className: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  live: { label: 'লাইভ', className: 'bg-danger/15 text-danger' },
  ended: { label: 'শেষ হয়েছে', className: 'bg-slate-100 dark:bg-slate-800 text-slate-400' },
  cancelled: { label: 'বাতিল', className: 'bg-slate-100 dark:bg-slate-800 text-slate-400' },
};

const MeetingsPage = () => {
  const { data, isLoading } = useGetMeetingsQuery({ limit: 30 });
  const [verifyJoin, { isLoading: isJoining }] = useVerifyJoinMutation();
  const [passwordModalMeeting, setPasswordModalMeeting] = useState(null);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const meetings = data?.data?.meetings || [];

  const attemptJoin = async (meetingId, pwd) => {
    try {
      await verifyJoin({ id: meetingId, password: pwd }).unwrap();
      navigate(`/dashboard/meetings/${meetingId}/room`);
    } catch (err) {
      if (err?.data?.message?.includes('পাসওয়ার্ড')) {
        setPasswordModalMeeting(meetingId);
      } else {
        toast.error(err?.data?.message || 'মিটিংয়ে যোগ দেওয়া ব্যর্থ হয়েছে');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-6 space-y-4">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">মিটিং</h1>

      {isLoading && (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      )}

      {!isLoading && meetings.length === 0 && (
        <div className="glass-card p-10 text-center text-slate-400">কোনো মিটিং শিডিউল নেই</div>
      )}

      {meetings.map((meeting) => {
        const statusInfo = STATUS_LABELS[meeting.status] || STATUS_LABELS.scheduled;
        const canJoin = meeting.status === 'live' || meeting.status === 'scheduled';

        return (
          <div key={meeting._id} className="glass-card p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-white truncate">{meeting.title}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
                <span className="flex items-center gap-1">
                  <FiClock size={12} /> {new Date(meeting.scheduledStart).toLocaleString('bn-BD')}
                </span>
                <span className="flex items-center gap-1">
                  <FiUser size={12} /> {meeting.host?.fullName}
                </span>
              </div>
            </div>

            {canJoin && (
              <Button
                className="!py-2 text-sm shrink-0"
                isLoading={isJoining}
                onClick={() => attemptJoin(meeting._id, '')}
              >
                যোগ দিন
              </Button>
            )}
          </div>
        );
      })}

      {passwordModalMeeting && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setPasswordModalMeeting(null)}
        >
          <div className="glass-card p-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <FiLock size={16} /> মিটিং পাসওয়ার্ড
            </p>
            <TextInput
              type="password"
              placeholder="পাসওয়ার্ড লিখুন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              className="w-full mt-4"
              isLoading={isJoining}
              onClick={() => attemptJoin(passwordModalMeeting, password)}
            >
              যোগ দিন
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
