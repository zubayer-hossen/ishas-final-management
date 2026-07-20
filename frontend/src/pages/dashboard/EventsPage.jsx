import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import {
  useGetEventsQuery,
  useRegisterForEventMutation,
  useUnregisterFromEventMutation,
} from '../../features/event/eventApi';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const EventsPage = () => {
  const { data, isLoading } = useGetEventsQuery({ upcoming: true, limit: 30 });
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation();
  const [unregisterFromEvent] = useUnregisterFromEventMutation();
  const [ticketEventId, setTicketEventId] = useState(null);

  const events = data?.data?.events || [];

  const handleRegister = async (id) => {
    try {
      await registerForEvent({ id }).unwrap();
      toast.success('রেজিস্ট্রেশন সফল হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    }
  };

  const handleUnregister = async (id) => {
    try {
      await unregisterFromEvent(id).unwrap();
      toast.success('রেজিস্ট্রেশন বাতিল করা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'বাতিল করা ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-6 space-y-4">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">আসন্ন ইভেন্ট</h1>

      {isLoading && (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <div className="glass-card p-10 text-center text-slate-400">কোনো আসন্ন ইভেন্ট নেই</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {events.map((event) => (
          <div key={event._id} className="glass-card overflow-hidden flex flex-col">
            {event.coverImage?.url && (
              <img src={event.coverImage.url} alt={event.title} className="h-36 w-full object-cover" />
            )}
            <div className="p-5 flex-1 flex flex-col">
              <p className="font-semibold text-slate-800 dark:text-white mb-2">{event.title}</p>

              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                <p className="flex items-center gap-1.5">
                  <FiCalendar size={12} /> {new Date(event.startDate).toLocaleString('bn-BD')}
                </p>
                {event.location && (
                  <p className="flex items-center gap-1.5">
                    <FiMapPin size={12} /> {event.location}
                  </p>
                )}
                <p className="flex items-center gap-1.5">
                  <FiUsers size={12} /> {event.participantCount ?? 0} জন অংশগ্রহণকারী
                </p>
              </div>

              <div className="mt-auto flex gap-2">
                {event.myRegistration ? (
                  <>
                    <Button
                      variant="ghost"
                      className="flex-1 !py-2 text-sm"
                      onClick={() => setTicketEventId(event._id)}
                    >
                      টিকেট দেখুন
                    </Button>
                    {!event.myRegistration.attended && (
                      <Button
                        variant="ghost"
                        className="!py-2 text-sm text-danger border-danger/30"
                        onClick={() => handleUnregister(event._id)}
                      >
                        বাতিল
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    className="flex-1 !py-2 text-sm"
                    isLoading={isRegistering}
                    onClick={() => handleRegister(event._id)}
                  >
                    রেজিস্ট্রেশন করুন
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {ticketEventId && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setTicketEventId(null)}
        >
          <div className="glass-card p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-4">আপনার প্রবেশ টিকেট</p>
            <img
              src={`${API_BASE_URL}/events/${ticketEventId}/ticket`}
              alt="Event QR Ticket"
              className="w-56 h-56 mx-auto rounded-xl bg-white p-3"
            />
            <p className="text-xs text-slate-400 mt-4">ইভেন্টে প্রবেশের সময় এই QR কোডটি দেখান</p>
            <Button variant="ghost" className="mt-4 !py-2 text-sm" onClick={() => setTicketEventId(null)}>
              বন্ধ করুন
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
