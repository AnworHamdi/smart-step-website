
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import Card from '../components/ui/Card';
import { Post } from '../types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { DataContext } from '../contexts/DataContext';
import { useSeo } from '../hooks/useSeo';
import BlogCardSkeleton from '../components/ui/BlogCardSkeleton';

const BlogCard: React.FC<{ post: Post }> = ({ post }) => {
  const { t } = useTranslation();
  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <img src={post.imageUrl} alt={t(post.title)} className="w-full h-48 object-cover" loading="lazy" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t(post.title)}</h3>
        <p
          className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4 flex-grow line-clamp-3"
          dangerouslySetInnerHTML={{ __html: t(post.excerpt) }}
        />
        <div className="text-xs text-gray-400 mt-auto">
          <span>{t('blog.author')} {post.author}</span> &bull; <span>{post.date}</span>
        </div>
        <Link to={`/blog/${post.id}`} className="mt-4 text-smart-blue font-semibold hover:underline">
          {t('blog.readMore')} &rarr;
        </Link>
      </div>
    </Card>
  );
};

const BlogPage: React.FC = () => {
  const { t } = useTranslation();
  const { posts, loading } = useContext(DataContext);
  useSeo(t('blog.title'), t('blog.subtitle'));
  const gridRef = useScrollAnimation<HTMLDivElement>();

  const publishedPosts = posts.filter(p => p.status === 'published');

  return (
    <div className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 animate-on-scroll is-visible">
          <h1 className="text-4xl md:text-5xl font-bold text-smart-blue">{t('blog.title')}</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t('blog.subtitle')}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        ) : publishedPosts.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedPosts.map((post, index) => (
              <div key={post.id} className="animate-on-scroll" style={{ transitionDelay: `${index * 100}ms` }}>
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>{t('dashboard.posts.noPosts')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
