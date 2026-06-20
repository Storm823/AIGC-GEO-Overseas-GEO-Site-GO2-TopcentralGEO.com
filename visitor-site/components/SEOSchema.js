import Head from 'next/head';

// Default Organization Schema
const defaultOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Topcentral GEO',
  alternateName: 'TopcentralGEO.com',
  url: 'https://www.TopcentralGEO.com',
  description: 'AIGC GEO (Generative Engine Optimization) platform helping businesses gain visibility across ChatGPT, Claude, Grok, Gemini, Perplexity, and DeepSeek.',
  logo: 'https://www.TopcentralGEO.com/images/logo.png',
  sameAs: [],
};

// Default Website Schema
const defaultWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Topcentral GEO - AIGC GEO Platform',
  url: 'https://www.TopcentralGEO.com',
  description: 'Power your presence in the AI era with AIGC GEO — Generative Engine Optimization for all major AI engines.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.TopcentralGEO.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function SEOSchema({
  type = 'WebPage',
  title,
  description,
  url,
  image,
  breadcrumb,
  product,
  article,
  faq,
}) {
  const schemas = [];

  // Always include Organization
  schemas.push(defaultOrganization);

  // Type-specific schema
  switch (type) {
    case 'WebSite':
      schemas.push(defaultWebSite);
      break;

    case 'Article':
      if (article) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.headline || title,
          description: description,
          image: image,
          datePublished: article.datePublished,
          dateModified: article.dateModified,
          author: {
            '@type': 'Organization',
            name: 'Topcentral GEO',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Topcentral GEO',
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
          },
        });
        
        // Breadcrumb for Article
        if (breadcrumb) {
          schemas.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.TopcentralGEO.com/' },
              { '@type': 'ListItem', position: 2, name: 'Articles', item: 'https://www.TopcentralGEO.com/articles/' },
              { '@type': 'ListItem', position: 3, name: title, item: url },
            ],
          });
        }
      }
      break;

    case 'Product':
      if (product) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image,
          brand: {
            '@type': 'Brand',
            name: 'Topcentral GEO',
          },
          offers: {
            '@type': 'Offer',
            price: product.price || '0',
            priceCurrency: product.currency || 'USD',
            availability: 'https://schema.org/InStock',
          },
        });
      }
      break;

    case 'FAQPage':
      if (faq && Array.isArray(faq)) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        });
      }
      break;

    default:
      // WebPage schema is the default
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title || 'Topcentral GEO',
        description: description || 'AIGC GEO platform for AI search visibility',
        url: url || 'https://www.TopcentralGEO.com',
      });
      break;
  }

  // Breadcrumb (standalone, for non-article pages)
  if (breadcrumb && type !== 'Article') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumb.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  return (
    <Head>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2),
          }}
        />
      ))}
    </Head>
  );
}
