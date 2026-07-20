import { useState, useRef, useEffect } from 'react';
import { FiSend, FiX } from 'react-icons/fi';

const ChatPanel = ({ messages, onSend, onClose }) => {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="w-full sm:w-80 h-full bg-slate-800 flex flex-col border-l border-slate-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <p className="text-white font-medium text-sm">মিটিং চ্যাট</p>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <FiX size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <p className="text-slate-500 text-xs text-center mt-6">এখনো কোনো বার্তা নেই</p>}
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm">
            <p className="text-primary-300 font-medium text-xs">{msg.fullName}</p>
            <p className="text-slate-100 mt-0.5 break-words">{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="বার্তা লিখুন..."
          className="flex-1 bg-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder:text-slate-400"
        />
        <button type="submit" className="w-9 h-9 rounded-lg bg-gradient-brand text-white flex items-center justify-center shrink-0">
          <FiSend size={15} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
