import { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = forwardRef(({ label, error, className = '', ...rest }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      {label && <label className="field-label">{label}</label>}
      <div className="relative">
        <input ref={ref} type={visible ? 'text' : 'password'} className="input-field pr-11" {...rest} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label={visible ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
          tabIndex={-1}
        >
          {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
