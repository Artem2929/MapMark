import { forwardRef } from 'react';
import { classNames, createBEM } from '../../utils/classNames';

const btnClass = createBEM('btn');

/**
 * Button component following BEM methodology
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, outline, ghost)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Click handler
 * @param {string} props.type - Button type (button, submit, reset)
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  const buttonClass = classNames(
    btnClass(),
    btnClass(null, variant),
    size !== 'md' && btnClass(null, size),
    {
      [btnClass(null, 'loading')]: loading,
      [btnClass(null, 'disabled')]: disabled,
    },
    className
  );

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={btnClass('spinner')} aria-hidden="true">
          <span className="loading__spinner" />
        </span>
      )}
      <span className={btnClass('content')}>
        {children}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;