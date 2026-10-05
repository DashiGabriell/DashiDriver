import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  label?: string;
  children?: React.ReactNode;
  onClick?(): void;
  className?: string;
  variant?: 'primary' | 'danger' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Component = forwardRef<HTMLButtonElement, ComponentProps>(
  ({ label = "Generate", onClick, className, variant = 'primary', children, type = 'button', disabled = false }, ref) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
      onClick?.();
    };

    const baseClass = 
      variant === 'danger' ? 'glow-btn-danger' : 
      variant === 'secondary' ? 'glow-btn-secondary' : 
      'glow-btn';

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cn(baseClass, disabled && "opacity-50 cursor-not-allowed", className)}
        onClick={disabled ? undefined : handleClick}
        disabled={disabled}
        data-state={isClicked ? "clicked" : undefined}
      >
        {children || label}
      </button>
    );
  }
);

Component.displayName = "Component";