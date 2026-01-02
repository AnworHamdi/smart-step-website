import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
    const { t } = useTranslation();
    const [activeId, setActiveId] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    // Extract headings from HTML content
    const headings = useMemo(() => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const items: TOCItem[] = [];

        doc.querySelectorAll('h2, h3').forEach((heading, index) => {
            const id = heading.id || `heading-${index}`;
            items.push({
                id,
                text: heading.textContent || '',
                level: heading.tagName === 'H2' ? 2 : 3,
            });
        });

        return items;
    }, [content]);

    // Add IDs to headings in the actual DOM
    useEffect(() => {
        const articleContent = document.querySelector('.prose');
        if (articleContent) {
            articleContent.querySelectorAll('h2, h3').forEach((heading, index) => {
                if (!heading.id) {
                    heading.id = `heading-${index}`;
                }
            });
        }
    }, [content]);

    // Track active heading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-80px 0px -80% 0px' }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length < 2) return null;

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const top = element.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
            setIsExpanded(false);
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="lg:hidden fixed bottom-20 right-4 z-40 p-3 bg-smart-blue text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Toggle table of contents"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            </button>

            {/* Desktop Sticky Sidebar */}
            <nav className="hidden lg:block sticky top-28 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                        Table of Contents
                    </h4>
                    <ul className="space-y-2">
                        {headings.map(({ id, text, level }) => (
                            <li key={id}>
                                <button
                                    onClick={() => scrollToHeading(id)}
                                    className={`text-left w-full text-sm transition-all duration-200 hover:text-smart-blue ${level === 3 ? 'ps-4' : ''
                                        } ${activeId === id
                                            ? 'text-smart-blue font-semibold'
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    {text}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Mobile Slide-up Panel */}
            {isExpanded && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsExpanded(false)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-2xl p-6 max-h-[60vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                Table of Contents
                            </h4>
                            <button onClick={() => setIsExpanded(false)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <ul className="space-y-3">
                            {headings.map(({ id, text, level }) => (
                                <li key={id}>
                                    <button
                                        onClick={() => scrollToHeading(id)}
                                        className={`text-left w-full text-base transition-all duration-200 hover:text-smart-blue ${level === 3 ? 'ps-4' : ''
                                            } ${activeId === id
                                                ? 'text-smart-blue font-semibold'
                                                : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
};

export default TableOfContents;
