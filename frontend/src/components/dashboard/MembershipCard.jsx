import { motion } from 'framer-motion';
import { toBanglaDigits } from '../../utils/banglaDigits';

const MembershipCard = ({ user }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-glow"
  >
    <div className="bg-gradient-brand p-6 text-white relative">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/10" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <p className="font-display font-bold text-lg">ISHAS Organization</p>
          <p className="text-xs text-white/70">ডিজিটাল সদস্য কার্ড</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center font-display font-bold">
          I
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <img
          src={
            user?.profilePicture?.url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=ffffff&color=4f46e5`
          }
          alt={user?.fullName}
          className="w-16 h-16 rounded-xl object-cover border-2 border-white/40"
        />
        <div className="min-w-0">
          <p className="font-semibold text-lg truncate">{user?.fullName}</p>
          <p className="text-sm text-white/80">{user?.role}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-xs relative z-10">
        <div>
          <p className="text-white/60">সদস্য আইডি</p>
          <p className="font-data font-semibold">{toBanglaDigits(user?.memberId) || 'অনুমোদনের অপেক্ষায়'}</p>
        </div>
        <div>
          <p className="text-white/60">স্ট্যাটাস</p>
          <p className="font-semibold capitalize">{user?.membershipStatus}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

export default MembershipCard;
