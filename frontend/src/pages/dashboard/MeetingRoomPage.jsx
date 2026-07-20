import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetMeetingByIdQuery } from '../../features/meeting/meetingApi';
import useMeetingSocket from '../../hooks/useMeetingSocket';
import VideoTile from '../../components/meeting/VideoTile';
import MeetingControls from '../../components/meeting/MeetingControls';
import ChatPanel from '../../components/meeting/ChatPanel';
import WaitingRoomPanel from '../../components/meeting/WaitingRoomPanel';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const MeetingRoomPage = () => {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  const { data: meetingData, isLoading: isMeetingLoading } = useGetMeetingByIdQuery(meetingId);
  const roomId = meetingData?.data?.roomId;

  const {
    status,
    errorMessage,
    isHost,
    localStream,
    micOn,
    cameraOn,
    handRaised,
    participants,
    waitingUsers,
    chatMessages,
    toggleMic,
    toggleCamera,
    toggleHandRaise,
    sendChatMessage,
    admitParticipant,
    rejectParticipant,
    endMeeting,
    leaveRoom,
  } = useMeetingSocket({ meetingId, roomId: roomId || '' });

  if (isMeetingLoading || !roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner size={32} className="text-primary-500" />
      </div>
    );
  }

  if (status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-center px-4">
        <Spinner size={32} className="text-primary-500 mb-4" />
        <p className="text-white font-medium">হোস্টের অনুমতির অপেক্ষা করা হচ্ছে...</p>
        <p className="text-slate-400 text-sm mt-1">হোস্ট আপনাকে গ্রহণ করলে স্বয়ংক্রিয়ভাবে যুক্ত হবেন</p>
      </div>
    );
  }

  if (status === 'rejected' || status === 'removed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-center px-4">
        <p className="text-white font-medium mb-4">
          {status === 'rejected' ? 'হোস্ট আপনার প্রবেশাধিকার প্রত্যাখ্যান করেছেন' : 'আপনাকে মিটিং থেকে সরিয়ে দেওয়া হয়েছে'}
        </p>
        <Button onClick={() => navigate('/dashboard/meetings')}>মিটিং তালিকায় ফিরে যান</Button>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-center px-4">
        <p className="text-white font-medium mb-4">মিটিং শেষ হয়ে গেছে</p>
        <Button onClick={() => navigate('/dashboard/meetings')}>মিটিং তালিকায় ফিরে যান</Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-center px-4">
        <p className="text-white font-medium mb-4">{errorMessage || 'একটি সমস্যা হয়েছে'}</p>
        <Button onClick={() => navigate('/dashboard/meetings')}>মিটিং তালিকায় ফিরে যান</Button>
      </div>
    );
  }

  const participantList = Object.entries(participants);

  return (
    <div className="fixed inset-0 bg-slate-950 flex">
      <div className="flex-1 flex flex-col relative">
        {isHost && (
          <WaitingRoomPanel waitingUsers={waitingUsers} onAdmit={admitParticipant} onReject={rejectParticipant} />
        )}

        <div className="flex-1 p-4 grid gap-3 overflow-y-auto" style={{
          gridTemplateColumns: `repeat(${Math.min(Math.ceil(Math.sqrt(participantList.length + 1)), 4) || 1}, minmax(0, 1fr))`,
        }}>
          <VideoTile stream={localStream} fullName="আপনি" isLocal micOn={micOn} cameraOn={cameraOn} isHost={isHost} />
          {participantList.map(([socketId, p]) => (
            <VideoTile
              key={socketId}
              stream={p.stream}
              fullName={p.fullName}
              micOn={p.micOn}
              cameraOn={p.cameraOn}
              isHost={p.isHost}
            />
          ))}
        </div>

        <MeetingControls
          micOn={micOn}
          cameraOn={cameraOn}
          handRaised={handRaised}
          isHost={isHost}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onToggleHand={toggleHandRaise}
          onToggleChat={() => setChatOpen((v) => !v)}
          onLeave={() => {
            leaveRoom();
            navigate('/dashboard/meetings');
          }}
          onEnd={() => {
            endMeeting();
            navigate('/dashboard/meetings');
          }}
        />
      </div>

      {chatOpen && (
        <ChatPanel messages={chatMessages} onSend={sendChatMessage} onClose={() => setChatOpen(false)} />
      )}
    </div>
  );
};

export default MeetingRoomPage;
