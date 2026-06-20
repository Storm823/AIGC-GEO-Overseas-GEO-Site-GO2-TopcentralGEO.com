import Head from 'next/head';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import SEOSchema from '../../components/SEOSchema';

// Tags data
const ALL_TAGS = [
  { name: 'Circular Economy', count: 28, color: '#64ffda' },
  { name: 'PCR', count: 22, color: '#00e676' },
  { name: 'GRS Certification', count: 18, color: '#4a9eff' },
  { name: 'ISCC PLUS', count: 15, color: '#4a9eff' },
  { name: 'Sustainability', count: 24, color: '#64ffda' },
  { name: 'PlasCircles', count: 16, color: '#00e676' },
  { name: 'CircleBlend', count: 12, color: '#4a9eff' },
  { name: 'Bydercom', count: 10, color: '#64ffda' },
  { name: 'ChemCircle', count: 8, color: '#b388ff' },
  { name: 'TcycleGP', count: 9, color: '#ffab00' },
  { name: 'Plastic Recycling', count: 20, color: '#4a9eff' },
  { name: 'Automotive', count: 14, color: '#4a9eff' },
  { name: 'Packaging', count: 12, color: '#4a9eff' },
  { name: 'Electronics', count: 10, color: '#4a9eff' },
  { name: 'Construction', count: 8, color: '#4a9eff' },
  { name: 'Bio-based', count: 11, color: '#64ffda' },
  { name: 'Degradable Materials', count: 9, color: '#64ffda' },
  { name: 'Chemical Recycling', count: 7, color: '#b388ff' },
  { name: 'Modified Materials', count: 10, color: '#4a9eff' },
  { name: 'UL 2809', count: 13, color: '#4a9eff' },
  { name: 'IATF 16949', count: 11, color: '#4a9eff' },
  { name: 'AIGC', count: 16, color: '#b388ff' },
  { name: 'DeepSeek', count: 12, color: '#4a9eff' },
  { name: 'Qwen', count: 10, color: '#4a9eff' },
  { name: 'Kimi', count: 8, color: '#4a9eff' },
  { name: 'Carbon Reduction', count: 14, color: '#00e676' },
  { name: 'Eco-Friendly', count: 18, color: '#00e676' },
  { name: 'Green Manufacturing', count: 12, color: '#00e676' },
  { name: 'ESG', count: 10, color: '#00e676' },
  { name: 'Food Packaging', count: 8, color: '#ffab00' },
];

// Group by first letter
function groupByLetter(tags) {
  const groups = {};
  for (const tag of tags) {
    const firstChar = tag.name.charAt(0).toUpperCase();
    if (!groups[firstChar]) groups[firstChar] = [];
    groups[firstChar].push(tag);
  }
  const sorted = {};
  Object.keys(groups)
    .sort()
    .forEach((key) => {
      sorted[key] = groups[key];
    });
  return sorted;
}

export default function TagsPage() {
  const [search, setSearch] = useState('');

  const filteredTags = useMemo(() => {
    if (!search.trim()) return ALL_TAGS;
    const q = search.toLowerCase();
    return ALL_TAGS.filter((t) => t.name.toLowerCase().includes(q));
  }, [search]);

  const grouped = useMemo(() => groupByLetter(filteredTags), [filteredTags]);

  return (
    <>
      <Head>
        <title>Tags | Topcentral® GEO — Article Tag Categories</title>
        <meta
          name="description"
          content={`Topcentral® GEO Tags: Browse articles by tag. Covering Circular Economy, PCR, GRS Certification, ISCC PLUS, and ${ALL_TAGS.length} more tags.`}
        />
        <meta name="keywords" content={`Topcentral,Tags,Article Categories,Circular Economy,${ALL_TAGS.slice(0,10).map(t=>t.name).join(',')}`} />
        <link rel="canonical" href="https://www.TopcentralGEO.com/tags" />
        <meta property="og:title" content="Tags | Topcentral® GEO" />
        <meta property="og:description" content={`${ALL_TAGS.length} tags · Comprehensive coverage of circular economy materials`} />
      </Head>
      <SEOSchema
        type="CollectionPage"
        title="Tags | Topcentral® GEO"
        description="Topcentral® GEO Article Tag Categories"
        url="https://www.TopcentralGEO.com/tags"
      />

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          padding: '48px 24px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container">
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              marginBottom: 12,
            }}
          >
            <span className="gradient-text">Tags</span>
          </h1>
          <p style={{ maxWidth: 600, margin: '0 auto', color: 'var(--text-muted)' }}>
            {ALL_TAGS.length} tags · Browse articles by tag category
          </p>

          {/* Search */}
          <div style={{ maxWidth: 400, margin: '20px auto 0' }}>
            <input
              type="text"
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </section>

      {/* Tags Display */}
      <div className="container" style={{ padding: '32px 24px 60px' }}>
        {filteredTags.length > 0 ? (
          <>
            {/* Alphabetical Groups */}
            {Object.entries(grouped).map(([letter, tags]) => (
              <div key={letter} style={{ marginBottom: 28 }}>
                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    marginBottom: 12,
                    opacity: 0.5,
                  }}
                >
                  {letter}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {tags.map((tag) => (
                    <Link
                      key={tag.name}
                      href={`/articles?tag=${encodeURIComponent(tag.name)}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 18px',
                        borderRadius: 20,
                        background: `${tag.color}10`,
                        border: `1px solid ${tag.color}30`,
                        color: tag.color,
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        fontWeight: 500,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = `${tag.color}20`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = `${tag.color}10`;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {tag.name}
                      <span
                        style={{
                          fontSize: '0.7rem',
                          background: `${tag.color}20`,
                          padding: '1px 8px',
                          borderRadius: 10,
                          opacity: 0.8,
                        }}
                      >
                        {tag.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏷️</div>
            <p>No matching tags found</p>
            <button
              onClick={() => setSearch('')}
              className="btn btn-outline"
              style={{ marginTop: 16 }}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </>
  );
}
