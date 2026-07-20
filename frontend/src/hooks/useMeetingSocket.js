import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAppSelector } from '../app/hooks';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL !== undefined
  ? import.meta.env.VITE_SOCKET_URL
  : 'http://localhost:5000';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

/**
 * Drives the entire real-time meeting experience: connects to the
 * `/meeting` Socket.IO namespace, manages local media, and maintains a
 * mesh of RTCPeerConnections (one per remote participant). Consistent
 * initiator rule: whoever *joins later* creates the offer to everyone
 * already in the room — this avoids "glare" (both sides offering at once).
 */
const useMeetingSocket = ({ meetingId, roomId }) => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const [status, setStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [participants, setParticipants] = useState({});
  const [waitingUsers, setWaitingUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  const socketRef = useRef(null);
  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);

  const closePeer = useCallback((socketId) => {
    const pc = peersRef.current.get(socketId);
    if (pc) {
      pc.close();
      peersRef.current.delete(socketId);
    }
  }, []);

  const createPeerConnection = useCallback(
    (remoteSocketId, isInitiator) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current.set(remoteSocketId, pc);

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('signal', {
            roomId,
            to: remoteSocketId,
            data: { candidate: event.candidate },
          });
        }
      };

      pc.ontrack = (event) => {
        setParticipants((prev) => ({
          ...prev,
          [remoteSocketId]: { ...prev[remoteSocketId], stream: event.streams[0] },
        }));
      };

      if (isInitiator) {
        pc.onnegotiationneeded = async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current?.emit('signal', {
              roomId,
              to: remoteSocketId,
              data: { sdp: pc.localDescription },
            });
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Negotiation failed', err);
          }
        };
      }

      return pc;
    },
    [roomId]
  );

  const handleSignal = useCallback(
    async ({ from, data }) => {
      let pc = peersRef.current.get(from);

      if (data.sdp) {
        if (data.sdp.type === 'offer') {
          if (!pc) pc = createPeerConnection(from, false);
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current?.emit('signal', { roomId, to: from, data: { sdp: pc.localDescription } });
        } else if (data.sdp.type === 'answer' && pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        }
      } else if (data.candidate && pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch {
          // benign — candidate may arrive before remote description in rare races
        }
      }
    },
    [createPeerConnection, roomId]
  );

  const connectToExisting = useCallback(
    (existingParticipants) => {
      const map = {};
      existingParticipants.forEach((p) => {
        map[p.socketId] = p;
        createPeerConnection(p.socketId, true);
      });
      setParticipants((prev) => ({ ...prev, ...map }));
    },
    [createPeerConnection]
  );

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch (err) {
        setStatus('error');
        setErrorMessage('ক্যামেরা/মাইক্রোফোন অ্যাক্সেস পাওয়া যায়নি। ব্রাউজার পারমিশন চেক করুন।');
        return;
      }

      const socket = io(`${SOCKET_URL}/meeting`, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join-room', { meetingId, roomId });
      });

      socket.on('waiting-for-approval', () => setStatus('waiting'));

      socket.on('join-approved', ({ isHost: hostFlag, existingParticipants }) => {
        setIsHost(hostFlag);
        setStatus('connected');
        connectToExisting(existingParticipants || []);
      });

      socket.on('join-approved-from-waiting', ({ existingParticipants }) => {
        setStatus('connected');
        connectToExisting(existingParticipants || []);
      });

      socket.on('join-rejected', () => setStatus('rejected'));
      socket.on('join-error', ({ message }) => {
        setStatus('error');
        setErrorMessage(message);
      });

      socket.on('waiting-room-update', ({ waitingUsers: users }) => setWaitingUsers(users));

      socket.on('participant-joined', (payload) => {
        setParticipants((prev) => ({ ...prev, [payload.socketId]: payload }));
      });

      socket.on('participant-left', ({ socketId }) => {
        closePeer(socketId);
        setParticipants((prev) => {
          const next = { ...prev };
          delete next[socketId];
          return next;
        });
      });

      socket.on('participant-updated', ({ socketId, ...changes }) => {
        setParticipants((prev) => ({
          ...prev,
          [socketId]: { ...prev[socketId], ...changes },
        }));
      });

      socket.on('signal', handleSignal);

      socket.on('chat-message', (msg) => setChatMessages((prev) => [...prev, msg]));

      socket.on('force-muted', () => {
        setMicOn(false);
        localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = false));
      });

      socket.on('removed-from-meeting', () => setStatus('removed'));
      socket.on('meeting-ended', () => setStatus('ended'));
    };

    setup();

    return () => {
      cancelled = true;
      socketRef.current?.emit('leave-room', { roomId });
      socketRef.current?.disconnect();
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, roomId, accessToken]);

  const toggleMic = useCallback(() => {
    const next = !micOn;
    setMicOn(next);
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
    socketRef.current?.emit('toggle-mic', { roomId, value: next });
  }, [micOn, roomId]);

  const toggleCamera = useCallback(() => {
    const next = !cameraOn;
    setCameraOn(next);
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
    socketRef.current?.emit('toggle-camera', { roomId, value: next });
  }, [cameraOn, roomId]);

  const toggleHandRaise = useCallback(() => {
    const next = !handRaised;
    setHandRaised(next);
    socketRef.current?.emit('raise-hand', { roomId, value: next });
  }, [handRaised, roomId]);

  const sendChatMessage = useCallback(
    (text) => {
      if (!text?.trim()) return;
      socketRef.current?.emit('chat-message', { roomId, text });
    },
    [roomId]
  );

  const admitParticipant = useCallback(
    (socketId) => socketRef.current?.emit('admit-participant', { roomId, socketId }),
    [roomId]
  );
  const rejectParticipant = useCallback(
    (socketId) => socketRef.current?.emit('reject-participant', { roomId, socketId }),
    [roomId]
  );
  const muteParticipant = useCallback(
    (targetSocketId) => socketRef.current?.emit('mute-participant', { roomId, targetSocketId }),
    [roomId]
  );
  const removeParticipant = useCallback(
    (targetSocketId) => socketRef.current?.emit('remove-participant', { roomId, targetSocketId }),
    [roomId]
  );
  const endMeeting = useCallback(() => socketRef.current?.emit('end-meeting', { roomId }), [roomId]);
  const leaveRoom = useCallback(() => socketRef.current?.emit('leave-room', { roomId }), [roomId]);

  return {
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
    muteParticipant,
    removeParticipant,
    endMeeting,
    leaveRoom,
  };
};

export default useMeetingSocket;
