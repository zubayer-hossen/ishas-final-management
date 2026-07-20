import { useEffect, useRef } from 'react';
import { FiMicOff, FiVideoOff } from 'react-icons/fi';

const VideoTile = ({ stream, fullName, isLocal = false, micOn = true, cameraOn = true, isHost = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
      {stream && cameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center text-white font-display font-bold text-xl">
          {fullName?.[0] || '?'}
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
          {!micOn && <FiMicOff size={11} />}
          {fullName} {isLocal && '(আপনি)'}
        </span>
        {isHost && (
          <span className="bg-primary-600/80 text-white text-[10px] px-1.5 py-0.5 rounded-md">হোস্ট</span>
        )}
      </div>

      {!cameraOn && stream && (
        <div className="absolute top-2 right-2 text-white/70">
          <FiVideoOff size={14} />
        </div>
      )}
    </div>
  );
};

export default VideoTile;
