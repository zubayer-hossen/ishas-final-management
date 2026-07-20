import { forwardRef } from 'react';
import Spinner from './Spinner';

/**
 * Primary action button. Variants: 'gradient' (default) | 'ghost'.
 */
const Button = forwardRef(
  ({ children, variant = 'gradient', isLoading = false, className = '', disabled, type = 'button', ...rest }, ref) => {
    const base = variant === 'ghost' ? 'btn-ghost' : 'btn-gradient';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${base} inline-flex items-center justify-center gap-2 ${className}`}
        {...rest}
      >
        {isLoading && <Spinner size={16} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
