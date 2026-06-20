import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'profile' | 'article';
  url?: string;
}

export default function SEO({
  title,
  description = 'UNI9JA MEDIA is the premier platform for college spotlight competitions, talent showcases, and dynamic community voting in Nigeria. Participate, vote, and support your peers.',
  image = '/assets/banner.png',
  type = 'website',
  url,
}: SEOProps) {
  const siteTitle = 'UNI9JA MEDIA';
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - Spotlighting Nigeria's College Talents`;
  
  // Social media scrappers require absolute URLs for og:url and og:image
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://uni9jamedia.com';
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : origin);
  
  const absoluteImage = image.startsWith('http') ? image : `${origin}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* Canonical Link */}
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
}
