import { useState, useRef, useEffect } from 'react';
import { FiSend, FiX } from 'react-icons/fi';

const ChatPanel = ({ messages, onSend, onClose }) => {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Auto-focus so mobile users can start typing immediately after opening
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div
      className="fixed inset-0 z-40 sm:static sm:inset-auto sm:z-auto
                 w-full sm:w-80 h-full bg-slate-800 flex flex-col
                 sm:border-l border-slate-700"
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700 shrink-0">
        <p className="text-white font-medium text-sm">মিটিং চ্যাট</p>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1" aria-label="বন্ধ করুন">
          <FiX size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && <p className="text-slate-500 text-xs text-center mt-6">এখনো কোনো বার্তা নেই</p>}
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm">
            <p className="text-primary-300 font-medium text-xs">{msg.fullName}</p>
            <p className="text-slate-100 mt-0.5 break-words whitespace-pre-line">{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700 flex gap-2 shrink-0 safe-area-bottom">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="বার্তা লিখুন..."
          autoComplete="off"
          className="flex-1 min-w-0 bg-slate-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 rounded-lg bg-gradient-brand text-white flex items-center justify-center shrink-0 disabled:opacity-40"
        >
          <FiSend size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
