import { FiX, FiMic, FiMicOff, FiVideoOff, FiUserX } from 'react-icons/fi';
import { MdPanTool } from 'react-icons/md';

const ParticipantRow = ({ name, isYou, isHost, micOn, cameraOn, handRaised, canModerate, onMute, onRemove }) => (
  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 rounded-lg">
    <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-semibold shrink-0">
      {name?.[0] || '?'}
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-sm text-white truncate">
        {name} {isYou && <span className="text-slate-400">(আপনি)</span>}
      </p>
      {isHost && <p className="text-[11px] text-primary-400">হোস্ট</p>}
    </div>

    <div className="flex items-center gap-2 shrink-0 text-slate-400">
      {handRaised && <MdPanTool size={15} className="text-warning" />}
      {!cameraOn && <FiVideoOff size={14} />}
      {micOn ? <FiMic size={14} /> : <FiMicOff size={14} className="text-danger" />}

      {canModerate && !isYou && (
        <>
          <button onClick={onMute} className="p-1.5 hover:text-white" title="মিউট করুন" aria-label="মিউট করুন">
            <FiMicOff size={14} />
          </button>
          <button onClick={onRemove} className="p-1.5 hover:text-danger" title="সরিয়ে দিন" aria-label="সরিয়ে দিন">
            <FiUserX size={14} />
          </button>
        </>
      )}
    </div>
  </div>
);

const ParticipantsPanel = ({ participants, isHost, onClose, onMute, onRemove }) => {
  const list = Object.entries(participants);

  return (
    <div className="fixed inset-0 z-40 sm:static sm:inset-auto sm:z-auto w-full sm:w-80 h-full bg-slate-800 flex flex-col sm:border-l border-slate-700">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700 shrink-0">
        <p className="text-white font-medium text-sm">অংশগ্রহণকারী ({list.length + 1})</p>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1" aria-label="বন্ধ করুন">
          <FiX size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <ParticipantRow name="আপনি" isYou isHost={isHost} micOn cameraOn handRaised={false} canModerate={false} />
        {list.map(([socketId, p]) => (
          <ParticipantRow
            key={socketId}
            name={p.fullName}
            isHost={p.isHost}
            micOn={p.micOn}
            cameraOn={p.cameraOn}
            handRaised={p.handRaised}
            canModerate={isHost}
            onMute={() => onMute(socketId)}
            onRemove={() => onRemove(socketId)}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticipantsPanel;
