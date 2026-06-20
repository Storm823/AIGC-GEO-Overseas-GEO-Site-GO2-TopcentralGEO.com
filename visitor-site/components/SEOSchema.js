import Head from 'next/head';

// Default Organization Schema
const defaultOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Topcentral® GEO',
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
  name: 'Topcentral® GEO - AIGC GEO Platform',
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

  // 页面类型 Schema
  if (type === 'WebPage' || type === 'AboutPage' || type === 'CollectionPage') {
    const pageSchema = {
      '@context': 'https://schema.org',
      '@type': type,
      name: title,
      description: description,
      url: url || 'https://itopcentral.vip',
      ...(image && { image }),
      ...(breadcrumb && {
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumb.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url,
          })),
        },
      }),
    };
    schemas.push(pageSchema);
  }

  // 产品 Schema
  if (product) {
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
      ...(product.category && { category: product.category }),
      ...(product.image && { image: product.image }),
      ...(product.sku && { sku: product.sku }),
      ...(product.mpn && { mpn: product.mpn }),
    };
    schemas.push(productSchema);
  }

  // 文章 Schema
  if (article) {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      ...(article.image && { image: article.image }),
      ...(article.datePublished && { datePublished: article.datePublished }),
      ...(article.dateModified && { dateModified: article.dateModified }),
      ...(article.author && {
        author: {
          '@type': 'Person',
          name: article.author,
        },
      }),
    };
    schemas.push(articleSchema);
  }

  // FAQ Schema
  if (faq) {
    const faqSchema = {
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
    };
    schemas.push(faqSchema);
  }

  // 始终包含组织+网站 Schema
  schemas.push(defaultOrganization);
  schemas.push(defaultWebSite);

  return (
    <Head>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
}
