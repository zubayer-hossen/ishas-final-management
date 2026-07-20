import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useGetTicketByIdQuery, useAddTicketReplyMutation } from '../../features/support/supportApi';
import { useAppSelector } from '../../app/hooks';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetTicketByIdQuery(id);
  const [addReply, { isLoading: isSending }] = useAddTicketReplyMutation();
  const currentUserId = useAppSelector((state) => state.auth.user?._id);

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
        <p className="text-xs text-slate-400 mb-1">{ticket.ticketNumber}</p>
        <h1 className="text-xl font-display font-bold text-slate-800 dark:text-white">{ticket.subject}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 whitespace-pre-line">{ticket.description}</p>
      </div>

      <div className="space-y-3">
        {ticket.replies.map((reply) => {
          const isMine = reply.user?._id === currentUserId;
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
