import React from 'react';
import Card from './Card';
import Skeleton from './Skeleton';

const BlogCardSkeleton: React.FC = () => {
  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <Skeleton className="w-full h-48" />
      <div className="p-6 flex flex-col flex-grow">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="mt-auto">
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      </div>
    </Card>
  );
};

export default BlogCardSkeleton;
