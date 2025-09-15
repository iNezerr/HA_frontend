import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  canonical?: string;
  tags?: string[];
}

const SEO: React.FC<SEOProps> = ({
  title = 'Hues Apply - Find Jobs, Scholarships & Grants | AI-Powered Career Platform',
  description = 'Discover thousands of jobs, scholarships, and grants tailored for you. AI-powered career platform helping students and professionals find opportunities worldwide.',
  keywords = 'scholarships, grants, jobs, career opportunities, remote jobs, student scholarships, job search, career platform, AI career matching, education funding',
  image = '/hero/hues_apply_logo.svg',
  url = 'https://huesapply.com',
  type = 'website',
  canonical
}) => {
  const fullUrl = canonical || `${url}${window.location.pathname}`;
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Helper to upsert meta tags by name or property
    const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let element = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Title
    document.title = title;
    upsertMeta('name', 'title', title);
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);

    // Canonical link
    let linkCanonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical ? canonical : fullUrl);

    // Open Graph
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', fullUrl);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', fullImageUrl);
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');
    upsertMeta('property', 'og:site_name', 'Hues Apply');
    upsertMeta('property', 'og:locale', 'en_US');

    // Twitter
    upsertMeta('property', 'twitter:card', 'summary_large_image');
    upsertMeta('property', 'twitter:url', fullUrl);
    upsertMeta('property', 'twitter:title', title);
    upsertMeta('property', 'twitter:description', description);
    upsertMeta('property', 'twitter:image', fullImageUrl);

    // Robots
    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }, [title, description, keywords, image, url, type, canonical, fullUrl, fullImageUrl]);

  // This component does not render anything. It only updates the head.
  return null;
};

export default SEO;
