import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { DataContext } from '../contexts/DataContext';
import { useSeo } from '../hooks/useSeo';
import BlogPostSkeleton from '../components/ui/BlogPostSkeleton';

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { posts, loading } = useContext(DataContext);
  const post = posts.find(p => p.id === id);

  useSeo(
    post ? t(post.title) : t('blog.title'),
    post ? t(post.excerpt) : t('blog.subtitle')
  );

  if (loading) {
    return (
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <BlogPostSkeleton />
        </div>
      </div>
    );
  }

  if (!post || post.status !== 'published') {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold">{t('blog.postNotFound')}</h1>
        <Link to="/blog" className="mt-4 inline-block text-smart-blue hover:underline">
          {t('blog.backToBlog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-4xl">
        <article className="animate-on-scroll is-visible">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-4">
              {t(post.title)}
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span>{t('blog.author')} {post.author}</span> | <span>{t('blog.publishedOn')} {post.date}</span>
            </div>
          </header>
          <img
            src={post.imageUrl}
            alt={t(post.title)}
            className="w-full rounded-xl shadow-lg mb-8 animate-on-scroll is-visible aspect-[4/3] object-cover bg-gray-200"
            style={{ transitionDelay: `200ms` }}
            loading="lazy"
          />
          <div
            className="prose prose-lg lg:prose-xl max-w-none prose-gray dark:prose-invert prose-headings:text-smart-blue prose-a:text-smart-green hover:prose-a:text-green-700 animate-on-scroll is-visible"
            style={{ transitionDelay: `400ms` }}
            dangerouslySetInnerHTML={{ __html: t(post.content) }}
          />
        </article>
      </div>
    </div>
  );
};

export default BlogPostPage;