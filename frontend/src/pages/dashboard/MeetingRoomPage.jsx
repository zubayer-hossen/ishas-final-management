import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import { useGetMeetingByIdQuery } from '../../features/meeting/meetingApi';
import useMeetingSocket from '../../hooks/useMeetingSocket';
import VideoTile from '../../components/meeting/VideoTile';
import MeetingControls from '../../components/meeting/MeetingControls';
import ChatPanel from '../../components/meeting/ChatPanel';
import ParticipantsPanel from '../../components/meeting/ParticipantsPanel';
import WaitingRoomPanel from '../../components/meeting/WaitingRoomPanel';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const GRID_COLS_BY_COUNT = (count) => {
  if (count <= 1) return 'grid-cols-1';
  if (count <= 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count <= 4) return 'grid-cols-2';
  if (count <= 6) return 'grid-cols-2 sm:grid-cols-3';
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
};

const MeetingRoomPage = () => {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  const [sidePanel, setSidePanel] = useState(null); // null | 'chat' | 'participants'

  const { data: meetingData, isLoading: isMeetingLoading } = useGetMeetingByIdQuery(meetingId);
  const meeting = meetingData?.data;
  const roomId = meeting?.roomId;

  const {
    status,
    errorMessage,
    isHost,
    localStream,
    micOn,
    cameraOn,
    handRaised,
    isScreenSharing,
    participants,
    waitingUsers,
    chatMessages,
    unreadChatCount,
    toggleMic,
    toggleCamera,
    toggleHandRaise,
    toggleScreenShare,
    sendChatMessage,
    setChatOpen,
    admitParticipant,
    rejectParticipant,
    muteParticipant,
    removeParticipant,
    endMeeting,
    leaveRoom,
  } = useMeetingSocket({ meetingId, roomId: roomId || '' });

  const participantList = useMemo(() => Object.entries(participants), [participants]);

  // If anyone (including me) is presenting, pin that tile large — mirrors
  // how Google Meet foregrounds the shared screen instead of showing it as
  // just another small square in the grid.
  const pinnedRemote = participantList.find(([, p]) => p.screenSharing);
  const isPinnedModeActive = isScreenSharing || !!pinnedRemote;

  const openChat = () => {
    setSidePanel((prev) => (prev === 'chat' ? null : 'chat'));
    setChatOpen(sidePanel !== 'chat');
  };
  const closeChat = () => {
    setSidePanel(null);
    setChatOpen(false);
  };
  const openParticipants = () => setSidePanel((prev) => (prev === 'participants' ? null : 'participants'));

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

  return (
    <div className="fixed inset-0 bg-slate-950 flex overflow-hidden">
      <div className="flex-1 flex flex-col relative min-w-0">
        {isHost && (
          <WaitingRoomPanel waitingUsers={waitingUsers} onAdmit={admitParticipant} onReject={rejectParticipant} />
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 shrink-0">
          <p className="text-white text-sm font-medium truncate pr-2">{meeting?.title}</p>
          <span className="flex items-center gap-1.5 text-slate-400 text-xs shrink-0">
            <FiClock size={12} /> {participantList.length + 1} জন
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 pb-2">
          {isPinnedModeActive ? (
            <div className="flex flex-col gap-3 h-full">
              {/* Pinned presentation tile */}
              <div className="flex-1 min-h-0">
                {isScreenSharing ? (
                  <VideoTile stream={localStream} fullName="আপনি" isLocal micOn={micOn} cameraOn screenSharing />
                ) : (
                  <VideoTile
                    stream={pinnedRemote[1].stream}
                    fullName={pinnedRemote[1].fullName}
                    micOn={pinnedRemote[1].micOn}
                    cameraOn={pinnedRemote[1].cameraOn}
                    screenSharing
                    isHost={pinnedRemote[1].isHost}
                  />
                )}
              </div>

              {/* Filmstrip of everyone else */}
              <div className="flex gap-2 overflow-x-auto pb-1 shrink-0" style={{ height: '90px' }}>
                <div className="w-32 h-full shrink-0">
                  <VideoTile stream={localStream} fullName="আপনি" isLocal micOn={micOn} cameraOn={cameraOn} isHost={isHost} handRaised={handRaised} />
                </div>
                {participantList
                  .filter(([sid]) => sid !== pinnedRemote?.[0])
                  .map(([socketId, p]) => (
                    <div key={socketId} className="w-32 h-full shrink-0">
                      <VideoTile
                        stream={p.stream}
                        fullName={p.fullName}
                        micOn={p.micOn}
                        cameraOn={p.cameraOn}
                        isHost={p.isHost}
                        handRaised={p.handRaised}
                        canModerate={isHost}
                        onMute={() => muteParticipant(socketId)}
                        onRemove={() => removeParticipant(socketId)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className={`grid gap-3 auto-rows-fr ${GRID_COLS_BY_COUNT(participantList.length + 1)}`}>
              <VideoTile
                stream={localStream}
                fullName="আপনি"
                isLocal
                micOn={micOn}
                cameraOn={cameraOn}
                isHost={isHost}
                handRaised={handRaised}
              />
              {participantList.map(([socketId, p]) => (
                <VideoTile
                  key={socketId}
                  stream={p.stream}
                  fullName={p.fullName}
                  micOn={p.micOn}
                  cameraOn={p.cameraOn}
                  isHost={p.isHost}
                  handRaised={p.handRaised}
                  canModerate={isHost}
                  onMute={() => muteParticipant(socketId)}
                  onRemove={() => removeParticipant(socketId)}
                />
              ))}
            </div>
          )}
        </div>

        <MeetingControls
          micOn={micOn}
          cameraOn={cameraOn}
          handRaised={handRaised}
          isScreenSharing={isScreenSharing}
          isHost={isHost}
          unreadChatCount={unreadChatCount}
          participantCount={participantList.length + 1}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onToggleHand={toggleHandRaise}
          onToggleScreenShare={toggleScreenShare}
          onToggleChat={openChat}
          onToggleParticipants={openParticipants}
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

      {sidePanel === 'chat' && <ChatPanel messages={chatMessages} onSend={sendChatMessage} onClose={closeChat} />}
      {sidePanel === 'participants' && (
        <ParticipantsPanel
          participants={participants}
          isHost={isHost}
          onClose={() => setSidePanel(null)}
          onMute={muteParticipant}
          onRemove={removeParticipant}
        />
      )}
    </div>
  );
};

export default MeetingRoomPage;
