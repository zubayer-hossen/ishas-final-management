const Logo = ({ className = '' }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-display font-bold shadow-glow">
      I
    </div>
    <span className="font-display font-bold text-lg text-slate-800 dark:text-white">ISHAS</span>
  </div>
);

export default Logo;
