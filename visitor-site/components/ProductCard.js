import Link from 'next/link';

/**
 * ProductCard — Product card component
 * Used on products list page to display product line summary
 *
 * @param {Object} product
 * @param {string} product.slug - Product slug
 * @param {string} product.name - Product name
 * @param {string} product.tagline - One-line description
 * @param {string} product.description - Detailed description
 * @param {string} product.category - Product category
 * @param {string[]} product.applications - Application areas
 * @param {string[]} product.certifications - Certifications list
 * @param {string} product.color - Theme color
 * @param {string} product.icon - Icon emoji
 * @param {string} product.tier - Grade/tier
 */
export default function ProductCard({ product, featured = false }) {
  const {
    slug = '',
    name = '',
    tagline = '',
    description = '',
    category = '',
    applications = [],
    certifications = [],
    color = 'var(--accent-blue)',
    icon = '🔬',
    tier = '',
  } = product;

  return (
    <Link
      href={`/products/${slug}`}
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
          ...(featured && {
            border: `1.5px solid ${color}44`,
            boxShadow: `0 0 30px ${color}11`,
          }),
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: '2rem',
              lineHeight: 1,
            }}
          >
            {icon}
          </span>
          <div>
            <h3
              style={{
                fontSize: '1.1rem',
                margin: 0,
                color: 'var(--text-primary)',
              }}
            >
              {name}
            </h3>
            {category && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                {category}
              </span>
            )}
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {tagline}
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
          {/* Certifications */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {certifications.slice(0, 3).map((cert) => (
              <span
                key={cert}
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--accent-green)',
                  background: 'var(--bg-secondary)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid var(--accent-green)22',
                }}
              >
                {cert}
              </span>
            ))}
          </div>

          {/* Applications count */}
          {applications.length > 0 && (
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}
            >
              {applications.length} applications
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
