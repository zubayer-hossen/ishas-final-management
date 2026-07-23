import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiClock, FiUser, FiLock, FiPlus, FiX, FiSlash } from 'react-icons/fi';
import {
  useGetMeetingsQuery,
  useVerifyJoinMutation,
  useCreateMeetingMutation,
  useCancelMeetingMutation,
} from '../../features/meeting/meetingApi';
import { useAppSelector } from '../../app/hooks';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/ui/Spinner';
import { ADMIN_ACCESS_ROLES } from '../../utils/roles';

const STATUS_LABELS = {
  scheduled: { label: 'নির্ধারিত', className: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  live: { label: 'লাইভ', className: 'bg-danger/15 text-danger' },
  ended: { label: 'শেষ হয়েছে', className: 'bg-slate-100 dark:bg-slate-800 text-slate-400' },
  cancelled: { label: 'বাতিল', className: 'bg-slate-100 dark:bg-slate-800 text-slate-400' },
};

const ScheduleMeetingForm = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      waitingRoomEnabled: true,
      allowChat: true,
      allowScreenShare: true,
      muteOnEntry: true,
      notifyAllActiveMembers: false,
    },
  });
  const [createMeeting, { isLoading }] = useCreateMeetingMutation();

  const onSubmit = async (formData) => {
    if (new Date(formData.scheduledEnd) <= new Date(formData.scheduledStart)) {
      toast.error('শেষের সময় অবশ্যই শুরুর সময়ের পরে হতে হবে');
      return;
    }
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      await createMeeting(payload).unwrap();
      toast.success('মিটিং শিডিউল করা হয়েছে');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'মিটিং শিডিউল করা ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">নতুন মিটিং শিডিউল করুন</h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <FiX size={18} />
          </button>
        </div>

        <TextInput
          label="মিটিং শিরোনাম"
          error={errors.title?.message}
          {...register('title', { required: 'শিরোনাম আবশ্যক' })}
        />

        <div>
          <label className="field-label">বিবরণ (ঐচ্ছিক)</label>
          <textarea className="input-field min-h-20" {...register('description')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="শুরু"
            type="datetime-local"
            error={errors.scheduledStart?.message}
            {...register('scheduledStart', { required: 'শুরুর সময় আবশ্যক' })}
          />
          <TextInput
            label="শেষ"
            type="datetime-local"
            error={errors.scheduledEnd?.message}
            {...register('scheduledEnd', { required: 'শেষের সময় আবশ্যক' })}
          />
        </div>

        <TextInput label="পাসওয়ার্ড (ঐচ্ছিক, কমপক্ষে ৪ ক্যারেক্টার)" {...register('password')} />

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300" {...register('waitingRoomEnabled')} />
            ওয়েটিং রুম
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300" {...register('muteOnEntry')} />
            প্রবেশে মিউট
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300" {...register('allowChat')} />
            চ্যাট চালু
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300" {...register('allowScreenShare')} />
            স্ক্রিন শেয়ার
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" className="rounded border-slate-300" {...register('notifyAllActiveMembers')} />
          সব সক্রিয় সদস্যকে ইমেইলে আমন্ত্রণ জানান
        </label>

        <Button type="submit" isLoading={isLoading} className="w-full">
          শিডিউল করুন
        </Button>
      </form>
    </div>
  );
};

const MeetingsPage = () => {
  const { data, isLoading } = useGetMeetingsQuery({ limit: 30 });
  const [verifyJoin, { isLoading: isJoining }] = useVerifyJoinMutation();
  const [cancelMeeting] = useCancelMeetingMutation();
  const [passwordModalMeeting, setPasswordModalMeeting] = useState(null);
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const canCreateMeeting = ADMIN_ACCESS_ROLES.includes(user?.role);

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

  const handleCancel = async (id) => {
    if (!window.confirm('এই মিটিং বাতিল করতে চান?')) return;
    try {
      await cancelMeeting(id).unwrap();
      toast.success('মিটিং বাতিল করা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'বাতিল ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">মিটিং</h1>
        {canCreateMeeting && (
          <Button className="!py-2 text-sm" onClick={() => setShowForm(true)}>
            <FiPlus size={15} /> নতুন মিটিং
          </Button>
        )}
      </div>

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

            <div className="flex items-center gap-2 shrink-0">
              {canCreateMeeting && meeting.status === 'scheduled' && (
                <button
                  onClick={() => handleCancel(meeting._id)}
                  className="text-danger/70 hover:text-danger p-2"
                  title="বাতিল করুন"
                >
                  <FiSlash size={15} />
                </button>
              )}
              {canJoin && (
                <Button className="!py-2 text-sm" isLoading={isJoining} onClick={() => attemptJoin(meeting._id, '')}>
                  যোগ দিন
                </Button>
              )}
            </div>
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

      {showForm && <ScheduleMeetingForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default MeetingsPage;
