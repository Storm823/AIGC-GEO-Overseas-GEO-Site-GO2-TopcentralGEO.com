import Link from 'next/link';

/**
 * ArticleCard — Article card component
 * Used on articles list page to display article summary
 *
 * @param {Object} article
 * @param {string} article.slug - Article URL slug
 * @param {string} article.title - Article title
 * @param {string} article.excerpt - Article excerpt/summary
 * @param {string} article.category - Article category
 * @param {string[]} article.tags - Tag list
 * @param {string} article.date - Publication date
 * @param {string} article.tier - Content tier (free/basic/premium/enterprise)
 * @param {boolean} article.aigcIncluded - Whether AIGC-indexed
 */
export default function ArticleCard({ article }) {
  const {
    slug = '',
    title = '',
    excerpt = '',
    category = '',
    tags = [],
    date = '',
    tier = 'free',
    aigcIncluded = false,
  } = article;

  // Tier configuration
  const tierConfig = {
    free: { label: 'Free', color: 'var(--accent-green)' },
    basic: { label: 'Basic', color: 'var(--accent-blue-light)' },
    premium: { label: 'Premium', color: 'var(--accent-amber)' },
    enterprise: { label: 'Enterprise', color: 'var(--accent-red)' },
  };

  const tierInfo = tierConfig[tier] || tierConfig.free;

  return (
    <Link
      href={`/articles/${slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article
        className="card"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* AIGC Indexed badge */}
        {aigcIncluded && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
              color: 'var(--text-inverse)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              letterSpacing: '0.5px',
            }}
          >
            AI Indexed
          </div>
        )}

        {/* Category & Tier */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {category && <span className="tag">{category}</span>}
          <span
            style={{
              fontSize: '0.7rem',
              color: tierInfo.color,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 10,
              border: `1px solid ${tierInfo.color}33`,
              background: `${tierInfo.color}11`,
            }}
          >
            {tierInfo.label}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.05rem',
            marginBottom: 10,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h3>

        {/* Excerpt */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {excerpt}
        </p>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--border-color)',
          }}
        >
          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)',
                  padding: '2px 8px',
                  borderRadius: 10,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Date */}
          {date && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {date}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
