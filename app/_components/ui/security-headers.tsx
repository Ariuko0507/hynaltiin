import Head from 'next/head';

interface SecurityHeadersProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
}

export function SecurityHeaders({ 
  title = 'Хяналтын Систем', 
  description = 'Байгууллагын даалгавар, биелэлт, хурлын удирдлагын систем',
  keywords = 'байгууллага, удирдлага, даалгавар, биелэлт, хурал, менежмент',
  canonical 
}: SecurityHeadersProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="mn_MN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      
      {/* Theme */}
      <meta name="theme-color" content="#3b82f6" />
      
      {/* Robots */}
      <meta name="robots" content="index, follow" />
    </Head>
  );
}
