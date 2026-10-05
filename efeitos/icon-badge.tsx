import React from 'react';

interface IconBadgeProps {
  icon: React.ReactNode;
  className?: string;
}

export function IconBadge({ icon, className = '' }: IconBadgeProps) {
  return (
    <div 
      className={`
        relative p-3 rounded-lg
        bg-gradient-to-br from-[#5b8af7] via-[#4f6ef6] to-[#4361f5]
        shadow-[0_4px_12px_rgba(79,110,246,0.4)]
        before:absolute before:inset-0 before:rounded-lg
        before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent
        before:pointer-events-none
        after:absolute after:inset-[1px] after:rounded-[7px]
        after:bg-gradient-to-br after:from-transparent after:to-black/10
        after:pointer-events-none
        flex items-center justify-center
        ${className}
      `}
    >
      <div className="relative z-10 text-white [&>svg]:w-6 [&>svg]:h-6">
        {icon}
      </div>
    </div>
  );
}
