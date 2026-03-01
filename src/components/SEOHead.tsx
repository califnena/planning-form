import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>;
}

const SEOHead = ({ title, description, canonicalUrl, ogImage, ogType = "website", jsonLd }: SEOHeadProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
    {ogImage && <meta property="og:image" content={ogImage} />}
    <meta property="og:type" content={ogType} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {ogImage && <meta name="twitter:image" content={ogImage} />}
    {jsonLd && (
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    )}
  </Helmet>
);

export default SEOHead;
