import { forwardRef } from 'react';

const TextInput = forwardRef(({ label, error, type = 'text', className = '', ...rest }, ref) => (
  <div className={className}>
    {label && <label className="field-label">{label}</label>}
    <input ref={ref} type={type} className="input-field" {...rest} />
    {error && <p className="field-error">{error}</p>}
  </div>
));

TextInput.displayName = 'TextInput';

export default TextInput;
