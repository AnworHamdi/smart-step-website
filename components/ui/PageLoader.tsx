import React from 'react';
import { LoadingSpinner } from './Icons';

const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <LoadingSpinner className="ni-3x text-smart-blue" />
    </div>
  );
};

export default PageLoader;