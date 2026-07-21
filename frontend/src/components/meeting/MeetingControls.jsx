import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiMessageSquare,
  FiPhoneOff,
  FiThumbsUp,
} from "react-icons/fi";

const ControlButton = ({ active, onClick, children, danger, label }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
      danger
        ? "bg-danger text-white hover:bg-red-600"
        : active
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-danger/90 text-white hover:bg-danger"
    }`}
  >
    {children}
  </button>
);

const MeetingControls = ({
  micOn,
  cameraOn,
  handRaised,
  isHost,
  onToggleMic,
  onToggleCamera,
  onToggleHand,
  onToggleChat,
  onLeave,
  onEnd,
}) => (
  <div className="flex items-center justify-center gap-3 py-4 bg-slate-900/80 backdrop-blur">
    <ControlButton active={micOn} onClick={onToggleMic} label="মাইক্রোফোন">
      {micOn ? <FiMic size={18} /> : <FiMicOff size={18} />}
    </ControlButton>

    <ControlButton active={cameraOn} onClick={onToggleCamera} label="ক্যামেরা">
      {cameraOn ? <FiVideo size={18} /> : <FiVideoOff size={18} />}
    </ControlButton>

    <ControlButton active={!handRaised} onClick={onToggleHand} label="হাত তোলা">
      <FiThumbsUp size={18} className={handRaised ? "text-warning" : ""} />
    </ControlButton>

    <ControlButton active onClick={onToggleChat} label="চ্যাট">
      <FiMessageSquare size={18} />
    </ControlButton>

    <button
      onClick={isHost ? onEnd : onLeave}
      className="px-5 h-12 rounded-full bg-danger text-white font-medium flex items-center gap-2 hover:bg-red-600"
    >
      <FiPhoneOff size={16} />
      {isHost ? "মিটিং শেষ করুন" : "বের হন"}
    </button>
  </div>
);

export default MeetingControls;
