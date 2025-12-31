import React from 'react';
import Card from './Card';
import Skeleton from './Skeleton';

const ServiceCardSkeleton: React.FC = () => {
  return (
    <Card>
      <div className="flex flex-col items-center text-center">
        <Skeleton className="w-16 h-16 rounded-full mb-4" />
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-1" />
      </div>
    </Card>
  );
};

export default ServiceCardSkeleton;
