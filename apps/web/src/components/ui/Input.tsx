import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => (
  <div className="form-group">
    {label && <label>{label}</label>}
    <input ref={ref} className={cn('input', error && 'border-red-400', className)} {...props} />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
