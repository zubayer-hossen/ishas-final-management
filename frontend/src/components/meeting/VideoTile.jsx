import { useEffect, useRef, useState } from 'react';
import { FiMicOff, FiVideoOff, FiMoreVertical, FiUserX, FiMic as FiMicIcon } from 'react-icons/fi';
import { MdScreenShare, MdPanTool } from 'react-icons/md';

const VideoTile = ({
  stream,
  fullName,
  isLocal = false,
  micOn = true,
  cameraOn = true,
  isHost = false,
  handRaised = false,
  screenSharing = false,
  canModerate = false,
  onMute,
  onRemove,
}) => {
  const videoRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`relative bg-slate-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center ring-2 transition-all ${
        handRaised ? 'ring-warning' : 'ring-transparent'
      }`}
    >
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full ${screenSharing ? 'object-contain bg-black' : 'object-cover'} ${
            isLocal && !screenSharing ? 'scale-x-[-1]' : ''
          } ${!cameraOn ? 'hidden' : ''}`}
        />
      )}
      {(!stream || !cameraOn) && (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-brand flex items-center justify-center text-white font-display font-bold text-lg sm:text-xl">
          {fullName?.[0] || '?'}
        </div>
      )}

      {/* Hand-raised indicator — top-left, hard to miss */}
      {handRaised && (
        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-warning flex items-center justify-center animate-pulse">
          <MdPanTool size={14} className="text-white" />
        </div>
      )}

      {/* Screen-share indicator */}
      {screenSharing && (
        <div className="absolute top-2 right-2 bg-primary-600 text-white text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
          <MdScreenShare size={12} /> স্ক্রিন শেয়ার করছেন
        </div>
      )}

      {!cameraOn && stream && !screenSharing && (
        <div className="absolute top-2 right-2 text-white/70">
          <FiVideoOff size={14} />
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1.5">
        <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1 min-w-0">
          {!micOn && <FiMicOff size={11} className="shrink-0" />}
          <span className="truncate">
            {fullName} {isLocal && '(আপনি)'}
          </span>
          {isHost && <span className="shrink-0 bg-primary-600/80 px-1.5 py-0.5 rounded-md text-[10px]">হোস্ট</span>}
        </span>

        {/* Host moderation menu for remote tiles only */}
        {canModerate && !isLocal && (
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-6 h-6 rounded-md bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              aria-label="অপশন"
            >
              <FiMoreVertical size={13} />
            </button>
            {menuOpen && (
              <div className="absolute bottom-7 right-0 bg-slate-800 rounded-lg shadow-lg overflow-hidden w-36 z-10">
                <button
                  onClick={() => {
                    onMute?.();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-slate-700 text-left"
                >
                  <FiMicIcon size={13} /> মিউট করুন
                </button>
                <button
                  onClick={() => {
                    onRemove?.();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-slate-700 text-left"
                >
                  <FiUserX size={13} /> সরিয়ে দিন
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTile;
