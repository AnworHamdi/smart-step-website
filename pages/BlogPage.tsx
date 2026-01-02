
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { Post } from '../types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { DataContext } from '../contexts/DataContext';
import { useSeo } from '../hooks/useSeo';
import BlogCardSkeleton from '../components/ui/BlogCardSkeleton';

// Reading time estimation helper
const estimateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

// Featured Post Hero Component
const FeaturedPost: React.FC<{ post: Post }> = ({ post }) => {
  const { t } = useTranslation();
  const readingTime = estimateReadingTime(t(post.content));

  return (
    <Link to={`/blog/${post.id}`} className="group block mb-16">
      <article className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-lg hover:shadow-2xl transition-all duration-500">
        {/* Hero Image */}
        <div className="relative aspect-[21/9] overflow-hidden">
          <img
            src={post.imageUrl}
            alt={t(post.title)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="eager"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            {/* Category Badge */}
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-white bg-smart-blue/90 rounded-full mb-4 uppercase">
              Featured
            </span>

            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 group-hover:text-smart-green transition-colors duration-300">
              {t(post.title)}
            </h2>

            <p className="text-white/80 text-base md:text-lg line-clamp-2 max-w-3xl mb-6" dangerouslySetInnerHTML={{ __html: t(post.excerpt) }} />

            <div className="flex items-center gap-4 text-sm text-white/70">
              <span className="font-medium">{post.author}</span>
              <span>•</span>
              <span>{post.date}</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Minimalist Blog Card Component
const BlogCard: React.FC<{ post: Post; index: number }> = ({ post, index }) => {
  const { t } = useTranslation();
  const readingTime = estimateReadingTime(t(post.content));

  return (
    <Link to={`/blog/${post.id}`} className="group block">
      <article
        className="h-full bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 animate-on-scroll"
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-zinc-800">
          <img
            src={post.imageUrl}
            alt={t(post.title)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span className="font-medium text-smart-blue">{post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{readingTime} min</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-smart-blue transition-colors duration-300 line-clamp-2">
            {t(post.title)}
          </h3>

          {/* Excerpt */}
          <p
            className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3"
            dangerouslySetInnerHTML={{ __html: t(post.excerpt) }}
          />

          {/* Read More Link */}
          <div className="mt-4 flex items-center text-sm font-semibold text-smart-blue group-hover:text-smart-green transition-colors duration-300">
            <span>{t('blog.readMore')}</span>
            <svg className="w-4 h-4 ms-1 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Featured Post Skeleton
const FeaturedPostSkeleton: React.FC = () => (
  <div className="mb-16 animate-pulse">
    <div className="relative aspect-[21/9] rounded-2xl bg-gray-200 dark:bg-zinc-800 overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 space-y-4">
        <div className="w-24 h-6 bg-gray-300 dark:bg-zinc-700 rounded-full" />
        <div className="w-3/4 h-10 bg-gray-300 dark:bg-zinc-700 rounded-lg" />
        <div className="w-1/2 h-6 bg-gray-300 dark:bg-zinc-700 rounded-lg" />
      </div>
    </div>
  </div>
);

const BlogPage: React.FC = () => {
  const { t } = useTranslation();
  const { posts, loading } = useContext(DataContext);
  useSeo(t('blog.title'), t('blog.subtitle'));
  const gridRef = useScrollAnimation<HTMLDivElement>();

  const publishedPosts = posts.filter(p => p.status === 'published');
  const featuredPost = publishedPosts[0];
  const remainingPosts = publishedPosts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Header Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center animate-on-scroll is-visible">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              {t('blog.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('blog.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="pb-24">
        <div className="container mx-auto px-6 lg:px-8">
          {loading ? (
            <>
              <FeaturedPostSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: 4 }).map((_, index) => (
                  <BlogCardSkeleton key={index} />
                ))}
              </div>
            </>
          ) : publishedPosts.length > 0 ? (
            <>
              {/* Featured Post */}
              {featuredPost && <FeaturedPost post={featuredPost} />}

              {/* Remaining Posts Grid */}
              {remainingPosts.length > 0 && (
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  {remainingPosts.map((post, index) => (
                    <BlogCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('dashboard.posts.noPosts')}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
