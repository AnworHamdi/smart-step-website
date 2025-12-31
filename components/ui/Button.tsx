import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, to, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseClasses = "px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 transform focus:outline-none focus-visible:ring-4 focus-visible:ring-opacity-50";
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-smart-blue to-soft-blue text-white shadow-lg hover:shadow-xl focus-visible:ring-blue-300',
    secondary: 'bg-white dark:bg-transparent text-smart-blue dark:text-soft-blue border-2 border-smart-blue dark:border-soft-blue hover:bg-smart-blue dark:hover:bg-soft-blue hover:text-white dark:hover:text-gray-900 focus-visible:ring-blue-200'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed transform-none' : 'hover:-translate-y-0.5';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`;

  if (to) {
    return (
      <Link 
        to={to} 
        className={combinedClasses}
        aria-disabled={disabled}
        onClick={(e) => { if (disabled) e.preventDefault(); }}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClasses} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;