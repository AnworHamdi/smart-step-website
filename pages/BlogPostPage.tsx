import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { DataContext } from '../contexts/DataContext';
import { useSeo } from '../hooks/useSeo';
import BlogPostSkeleton from '../components/ui/BlogPostSkeleton';
import ReadingProgress from '../components/blog/ReadingProgress';
import TableOfContents from '../components/blog/TableOfContents';
import AuthorBio from '../components/blog/AuthorBio';
import RelatedPosts from '../components/blog/RelatedPosts';

// Reading time estimation helper
const estimateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

// Back to top button component
const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-4 z-40 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      aria-label="Back to top"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

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
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-6 py-24 max-w-4xl">
          <BlogPostSkeleton />
        </div>
      </div>
    );
  }

  if (!post || post.status !== 'published') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center p-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
          <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-zinc-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('blog.postNotFound')}</h1>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-smart-blue text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('blog.backToBlog')}
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = estimateReadingTime(t(post.content));
  const translatedContent = t(post.content);

  return (
    <>
      <ReadingProgress />
      <BackToTop />

      <article className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
        {/* Hero Header */}
        <header className="relative">
          {/* Hero Image */}
          <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-gray-200 dark:bg-zinc-800">
            <img
              src={post.imageUrl}
              alt={t(post.title)}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="container mx-auto px-6 pb-12 md:pb-16">
              <div className="max-w-4xl">
                {/* Back Link */}
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                >
                  <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="text-sm font-medium">{t('blog.backToBlog')}</span>
                </Link>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                  {t(post.title)}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <span className="font-medium text-white">{post.author}</span>
                  <span className="w-1 h-1 rounded-full bg-white/50" />
                  <span>{t('blog.publishedOn')} {post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-white/50" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <div className="lg:grid lg:grid-cols-[1fr,280px] lg:gap-12 max-w-6xl mx-auto">
            {/* Main Content */}
            <main className="max-w-none lg:max-w-3xl">
              {/* Article Content */}
              <div
                className="prose prose-lg lg:prose-xl max-w-none 
                  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-a:text-smart-blue prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900 dark:prose-strong:text-white
                  prose-ul:my-6 prose-li:my-2
                  prose-img:rounded-xl prose-img:shadow-lg
                  dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: translatedContent }}
              />

              {/* Author Bio */}
              <AuthorBio name={post.author} />

              {/* Related Posts */}
              <RelatedPosts posts={posts} currentPostId={post.id} />
            </main>

            {/* Sidebar with TOC */}
            <aside className="hidden lg:block">
              <TableOfContents content={translatedContent} />
            </aside>
          </div>
        </div>

        {/* Mobile TOC */}
        <div className="lg:hidden">
          <TableOfContents content={translatedContent} />
        </div>
      </article>
    </>
  );
};

export default BlogPostPage;