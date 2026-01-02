import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Post } from '../../types';

interface RelatedPostsProps {
    posts: Post[];
    currentPostId: string;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts, currentPostId }) => {
    const { t } = useTranslation();

    // Get up to 3 posts that aren't the current post
    const relatedPosts = posts
        .filter(p => p.id !== currentPostId && p.status === 'published')
        .slice(0, 3);

    if (relatedPosts.length === 0) return null;

    return (
        <section className="mt-16 pt-12 border-t border-gray-200 dark:border-zinc-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Continue Reading
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                    <Link key={post.id} to={`/blog/${post.id}`} className="group block">
                        <article className="h-full bg-gray-50 dark:bg-zinc-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                            {/* Image */}
                            <div className="aspect-[16/10] overflow-hidden bg-gray-200 dark:bg-zinc-800">
                                <img
                                    src={post.imageUrl}
                                    alt={t(post.title)}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-smart-blue transition-colors duration-300">
                                    {t(post.title)}
                                </h4>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {post.date}
                                </p>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default RelatedPosts;
