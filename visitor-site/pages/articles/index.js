import Head from 'next/head';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import SEOSchema from '../../components/SEOSchema';
import ArticleCard from '../../components/ArticleCard';
import { ARTICLES } from '../../data/articles';

const CATEGORIES = ['All', 'Industry Trends', 'Technical Analysis', 'Certification', 'Digital Marketing'];

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((article) => {
      const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
      const matchesSearch = !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <>
      <Head>
        <title>Industry Insights | Topcentral® GEO Articles</title>
        <meta name="description" content="Explore the latest insights on circular economy, recycling technology, sustainability certifications, and AIGC GEO optimization." />
        <link rel="canonical" href="https://www.TopcentralGEO.com/articles" />
      </Head>
      <SEOSchema
        type="WebPage"
        title="Industry Insights | Topcentral® GEO"
        description="Latest articles on circular economy, recycling technology, and AIGC GEO optimization."
        url="https://www.TopcentralGEO.com/articles"
      />

      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '48px 24px 32px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: 12 }}>
            Industry Insights
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
            Expert perspectives on circular economy, recycling technology, and AIGC GEO optimization
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container" style={{ padding: '40px 24px' }}>
        {filteredArticles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <div>No articles found matching your criteria.</div>
          </div>
        ) : (
          <div className="grid-3" style={{ gap: 24 }}>
            {filteredArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
