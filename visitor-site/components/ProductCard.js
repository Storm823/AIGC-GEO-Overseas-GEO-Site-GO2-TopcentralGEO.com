import Link from 'next/link';

/**
 * ProductCard — 产品卡片组件
 * 用于产品列表页，展示产品线/产品概要
 *
 * @param {Object} product
 * @param {string} product.slug - 产品标识
 * @param {string} product.name - 产品名称
 * @param {string} product.tagline - 一句话描述
 * @param {string} product.description - 详细描述
 * @param {string} product.category - 产品线分类
 * @param {string[]} product.applications - 应用领域
 * @param {string[]} product.certifications - 认证列表
 * @param {string} product.color - 主题色
 * @param {string} product.icon - 图标 emoji
 * @param {string} product.tier - 等级
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
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${color}, var(--accent-cyan))`,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: `${color}15`,
              border: `1px solid ${color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-primary)',
                marginBottom: 4,
              }}
            >
              {name}
            </h3>
            {tagline && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color,
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                {tagline}
              </p>
            )}
          </div>

          {tier && (
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--accent-amber)',
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: 12,
                background: 'rgba(255, 171, 0, 0.1)',
                border: '1px solid rgba(255, 171, 0, 0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              {tier}
            </span>
          )}
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            flex: 1,
            marginBottom: 16,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </p>

        {/* Applications */}
        {applications.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              应用领域
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {applications.slice(0, 3).map((app) => (
                <span key={app} className="tag" style={{ fontSize: '0.7rem' }}>
                  {app}
                </span>
              ))}
              {applications.length > 3 && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    padding: '2px 8px',
                  }}
                >
                  +{applications.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              marginTop: 'auto',
              paddingTop: 12,
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {certifications.map((cert) => (
              <span
                key={cert}
                className="tag tag-green"
                style={{ fontSize: '0.65rem' }}
              >
                ✓ {cert}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
