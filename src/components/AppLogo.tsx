import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface AppLogoProps {
  size?: number | string;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 36, className = '' }) => {
  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 36;
  const iconSize = Math.round(numericSize * 0.62);

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center rounded-[26%] bg-gradient-to-b from-[#00c58d] via-[#00b07b] to-[#009b6a] shadow-md shadow-emerald-950/20 overflow-hidden flex-shrink-0 border border-emerald-300/30 text-white ${className}`}
    >
      <ShieldCheck
        size={iconSize}
        strokeWidth={2.4}
        className="text-white drop-shadow-xs"
      />
    </div>
  );
};
