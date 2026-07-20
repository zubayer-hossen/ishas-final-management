const WaitingRoomPanel = ({ waitingUsers, onAdmit, onReject }) => {
  if (!waitingUsers?.length) return null;

  return (
    <div className="absolute top-4 right-4 w-72 glass-card p-4 z-20">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
        অপেক্ষমাণ ({waitingUsers.length})
      </p>
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {waitingUsers.map((u) => (
          <li key={u.socketId} className="flex items-center justify-between gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{u.fullName}</span>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => onAdmit(u.socketId)}
                className="text-xs bg-success/15 text-success px-2 py-1 rounded-md font-medium"
              >
                গ্রহণ
              </button>
              <button
                onClick={() => onReject(u.socketId)}
                className="text-xs bg-danger/15 text-danger px-2 py-1 rounded-md font-medium"
              >
                প্রত্যাখ্যান
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WaitingRoomPanel;
