import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  useGetTicketByIdQuery,
  useAddTicketReplyMutation,
  useUpdateTicketStatusMutation,
} from '../../features/support/supportApi';
import { useAppSelector } from '../../app/hooks';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { MANAGE_ROLES } from '../../utils/roles';

const STATUS_OPTIONS = [
  { value: 'open', label: 'খোলা' },
  { value: 'in_progress', label: 'প্রক্রিয়াধীন' },
  { value: 'resolved', label: 'সমাধান হয়েছে' },
  { value: 'closed', label: 'বন্ধ' },
];

const TicketDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetTicketByIdQuery(id);
  const [addReply, { isLoading: isSending }] = useAddTicketReplyMutation();
  const [updateStatus] = useUpdateTicketStatusMutation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isStaff = MANAGE_ROLES.includes(currentUser?.role);

  const { register, handleSubmit, reset } = useForm();

  const ticket = data?.data;

  const onSubmit = async ({ message }) => {
    if (!message?.trim()) return;
    try {
      await addReply({ id, message }).unwrap();
      reset();
    } catch (err) {
      toast.error(err?.data?.message || 'উত্তর পাঠানো ব্যর্থ হয়েছে');
    }
  };

  const handleStatusChange = async (e) => {
    try {
      await updateStatus({ id, status: e.target.value }).unwrap();
      toast.success('স্ট্যাটাস পরিবর্তন করা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner size={28} className="text-primary-600" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="max-w-2xl mx-auto pt-6 space-y-4">
      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">{ticket.ticketNumber}</p>
            <h1 className="text-xl font-display font-bold text-slate-800 dark:text-white">{ticket.subject}</h1>
          </div>
          {isStaff && (
            <select value={ticket.status} onChange={handleStatusChange} className="input-field !py-2 !w-auto text-sm shrink-0">
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 whitespace-pre-line">{ticket.description}</p>
      </div>

      <div className="space-y-3">
        {ticket.replies.map((reply) => {
          const isMine = reply.user?._id === currentUser?._id;
          return (
            <div key={reply._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  reply.isStaffReply
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <p className="text-xs opacity-70 mb-0.5">{reply.user?.fullName}</p>
                <p>{reply.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {ticket.status !== 'closed' && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-3 flex gap-2">
          <textarea
            className="input-field flex-1 min-h-[2.75rem]"
            placeholder="উত্তর লিখুন..."
            {...register('message', { required: true })}
          />
          <Button type="submit" isLoading={isSending} className="!py-2 shrink-0">
            পাঠান
          </Button>
        </form>
      )}
    </div>
  );
};

export default TicketDetailPage;
