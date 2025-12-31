
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
