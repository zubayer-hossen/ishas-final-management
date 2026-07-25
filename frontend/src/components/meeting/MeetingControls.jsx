import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMessageSquare, FiPhoneOff, FiUsers } from 'react-icons/fi';
import { MdScreenShare, MdStopScreenShare, MdPanTool } from 'react-icons/md';

const ControlButton = ({ active, onClick, children, label, badge }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors shrink-0 ${
      active ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-danger/90 text-white hover:bg-danger'
    }`}
  >
    {children}
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </button>
);

const MeetingControls = ({
  micOn,
  cameraOn,
  handRaised,
  isScreenSharing,
  isHost,
  unreadChatCount = 0,
  participantCount,
  onToggleMic,
  onToggleCamera,
  onToggleHand,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onLeave,
  onEnd,
}) => (
  <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 py-3 bg-slate-900/90 backdrop-blur overflow-x-auto">
    <ControlButton active={micOn} onClick={onToggleMic} label="মাইক্রোফোন">
      {micOn ? <FiMic size={17} /> : <FiMicOff size={17} />}
    </ControlButton>

    <ControlButton active={cameraOn} onClick={onToggleCamera} label="ক্যামেরা">
      {cameraOn ? <FiVideo size={17} /> : <FiVideoOff size={17} />}
    </ControlButton>

    {/* Screen share hidden on very small screens where it's rarely usable well, still reachable via scroll */}
    <ControlButton active={isScreenSharing} onClick={onToggleScreenShare} label="স্ক্রিন শেয়ার">
      {isScreenSharing ? <MdStopScreenShare size={19} /> : <MdScreenShare size={19} />}
    </ControlButton>

    <ControlButton active={!handRaised} onClick={onToggleHand} label="হাত তোলা">
      <MdPanTool size={17} className={handRaised ? 'text-warning' : ''} />
    </ControlButton>

    <ControlButton active onClick={onToggleParticipants} label="অংশগ্রহণকারী" badge={0}>
      <FiUsers size={17} />
      {participantCount !== undefined && (
        <span className="absolute -bottom-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary-600 text-white text-[9px] font-bold flex items-center justify-center">
          {participantCount}
        </span>
      )}
    </ControlButton>

    <ControlButton active onClick={onToggleChat} label="চ্যাট" badge={unreadChatCount}>
      <FiMessageSquare size={17} />
    </ControlButton>

    <button
      onClick={isHost ? onEnd : onLeave}
      className="px-3.5 sm:px-5 h-11 sm:h-12 rounded-full bg-danger text-white font-medium flex items-center gap-1.5 sm:gap-2 hover:bg-red-600 shrink-0 text-sm"
    >
      <FiPhoneOff size={16} />
      <span className="hidden sm:inline">{isHost ? 'মিটিং শেষ করুন' : 'বের হন'}</span>
    </button>
  </div>
);

export default MeetingControls;
