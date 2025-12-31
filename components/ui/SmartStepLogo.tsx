
import React from 'react';
import logoIcon from '../../assets/smartstep-logo.png';

const SmartStepLogo: React.FC<{ className?: string; logoUrl?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoIcon}
        alt="Smart Step Logo"
        className="w-10 h-10 object-contain dark:brightness-110 dark:contrast-125"
      />
      <span className="text-2xl font-extrabold tracking-tight transition-colors duration-300">
        <span className="text-smart-blue dark:text-soft-blue">SMART</span>
        <span className="text-smart-green dark:text-soft-green">STEP</span>
        <sup className="text-xs font-bold text-gray-700 dark:text-gray-400">TM</sup>
      </span>
    </div>
  );
};

export default SmartStepLogo;