import React from 'react';
import Skeleton from './Skeleton';

const BlogPostSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <Skeleton className="h-12 w-3/4 mb-4" />
      <Skeleton className="h-4 w-1/2 mb-8" />
      <Skeleton className="w-full aspect-[4/3] rounded-xl mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <br />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-10/12" />
      </div>
    </div>
  );
};

export default BlogPostSkeleton;
