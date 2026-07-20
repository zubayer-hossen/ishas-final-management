import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiTrash2, FiEdit2, FiUserCheck } from 'react-icons/fi';
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useMarkEventAttendanceMutation,
} from '../../features/event/eventApi';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/ui/Spinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const CATEGORY_OPTIONS = [
  { value: 'seminar', label: 'সেমিনার' },
  { value: 'workshop', label: 'ওয়ার্কশপ' },
  { value: 'fundraiser', label: 'ফান্ডরেইজার' },
  { value: 'social', label: 'সামাজিক' },
  { value: 'religious', label: 'ধর্মীয়' },
  { value: 'sports', label: 'ক্রীড়া' },
  { value: 'other', label: 'অন্যান্য' },
];

const toDatetimeLocal = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

const EventForm = ({ event, onClose }) => {
  const isEdit = !!event;
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          category: event.category,
          location: event.location,
          startDate: toDatetimeLocal(event.startDate),
          endDate: toDatetimeLocal(event.endDate),
          registrationRequired: event.registrationRequired,
          maxParticipants: event.maxParticipants || '',
        }
      : { category: 'other', registrationRequired: true },
  });
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  const onSubmit = async (formData) => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'coverImage') {
        if (value?.[0]) fd.append('coverImage', value[0]);
      } else if (value !== '' && value !== undefined) {
        fd.append(key, value);
      }
    });

    try {
      if (isEdit) {
        await updateEvent({ id: event._id, formData: fd }).unwrap();
        toast.success('ইভেন্ট আপডেট হয়েছে');
      } else {
        await createEvent(fd).unwrap();
        toast.success('ইভেন্ট তৈরি করা হয়েছে');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
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
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">{isEdit ? 'ইভেন্ট সম্পাদনা' : 'নতুন ইভেন্ট'}</h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <FiX size={18} />
          </button>
        </div>

        <TextInput label="শিরোনাম" error={errors.title?.message} {...register('title', { required: 'শিরোনাম আবশ্যক' })} />

        <div>
          <label className="field-label">বিবরণ</label>
          <textarea className="input-field min-h-24" {...register('description', { required: true })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">ক্যাটাগরি</label>
            <select className="input-field" {...register('category')}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <TextInput label="স্থান" {...register('location')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextInput label="শুরু" type="datetime-local" {...register('startDate', { required: true })} />
          <TextInput label="শেষ" type="datetime-local" {...register('endDate', { required: true })} />
        </div>

        <div className="grid grid-cols-2 gap-3 items-end">
          <TextInput label="সর্বোচ্চ অংশগ্রহণকারী (ঐচ্ছিক)" type="number" {...register('maxParticipants')} />
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer pb-3">
            <input type="checkbox" className="rounded border-slate-300" {...register('registrationRequired')} />
            রেজিস্ট্রেশন আবশ্যক
          </label>
        </div>

        <div>
          <label className="field-label">কভার ছবি (ঐচ্ছিক)</label>
          <input type="file" accept="image/*" className="input-field" {...register('coverImage')} />
        </div>

        <Button type="submit" isLoading={isCreating || isUpdating} className="w-full">
          সংরক্ষণ করুন
        </Button>
      </form>
    </div>
  );
};

const AttendanceModal = ({ eventId, onClose }) => {
  const [qrCode, setQrCode] = useState('');
  const [markAttendance, { isLoading }] = useMarkEventAttendanceMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await markAttendance({ id: eventId, qrCode }).unwrap();
      toast.success(result.message || 'উপস্থিতি রেকর্ড হয়েছে');
      setQrCode('');
    } catch (err) {
      toast.error(err?.data?.message || 'ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">উপস্থিতি রেকর্ড করুন</h3>
          <button onClick={onClose} className="text-slate-400">
            <FiX size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">সদস্যের QR কোড স্ক্যান করুন অথবা কোড বসিয়ে দিন</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <TextInput placeholder="QR কোড" value={qrCode} onChange={(e) => setQrCode(e.target.value)} />
          <Button type="submit" isLoading={isLoading} className="w-full">
            রেকর্ড করুন
          </Button>
        </form>
        <a
          href={`${API_BASE_URL}/reports/events/${eventId}/attendance?format=pdf`}
          target="_blank"
          rel="noreferrer"
          className="block text-center text-xs text-primary-600 dark:text-primary-400 hover:underline mt-4"
        >
          উপস্থিতি রিপোর্ট ডাউনলোড করুন
        </a>
      </div>
    </div>
  );
};

const EventManagementPage = () => {
  const { data, isLoading } = useGetEventsQuery({ limit: 50 });
  const [deleteEvent] = useDeleteEventMutation();
  const [formEvent, setFormEvent] = useState(undefined); // undefined = closed, null = create, object = edit
  const [attendanceEventId, setAttendanceEventId] = useState(null);

  const events = data?.data?.events || [];

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id).unwrap();
      toast.success('ইভেন্ট মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'মুছে ফেলা ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">ইভেন্ট পরিচালনা</h1>
        <Button className="!py-2 text-sm" onClick={() => setFormEvent(null)}>
          <FiPlus size={15} /> নতুন ইভেন্ট
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event._id} className="glass-card p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 dark:text-white">{event.title}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(event.startDate).toLocaleString('bn-BD')} · {event.location}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setAttendanceEventId(event._id)}
                  className="text-primary-600 dark:text-primary-400"
                  title="উপস্থিতি"
                >
                  <FiUserCheck size={16} />
                </button>
                <button onClick={() => setFormEvent(event)} className="text-slate-500 hover:text-primary-600" title="সম্পাদনা">
                  <FiEdit2 size={15} />
                </button>
                <button onClick={() => handleDelete(event._id)} className="text-danger/70 hover:text-danger" title="মুছুন">
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && <div className="glass-card p-10 text-center text-slate-400">কোনো ইভেন্ট নেই</div>}
        </div>
      )}

      {formEvent !== undefined && <EventForm event={formEvent} onClose={() => setFormEvent(undefined)} />}
      {attendanceEventId && (
        <AttendanceModal eventId={attendanceEventId} onClose={() => setAttendanceEventId(null)} />
      )}
    </div>
  );
};

export default EventManagementPage;
