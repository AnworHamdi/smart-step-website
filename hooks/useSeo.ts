import { useEffect } from 'react';

/**
 * A custom hook to manage page-specific SEO attributes like title and meta description.
 * @param title The title for the page.
 * @param description The meta description for the page.
 */
export const useSeo = (title: string, description: string) => {
  useEffect(() => {
    // Set the document title
    if (title) {
        // Prevent duplicating the brand name if it's already in the title
        if (title.toLowerCase().includes('smart step')) {
            document.title = title;
        } else {
            document.title = `${title} | Smart Step`;
        }
    } else {
        document.title = 'Smart Step | الخطوة الذكية';
    }
    
    // Find and update the meta description tag
    if (description) {
        let metaDescription = document.querySelector('meta[name="description"]');
        
        if (!metaDescription) {
            // If it doesn't exist, create and append it
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        
        metaDescription.setAttribute('content', description);
    }
  }, [title, description]);
};
