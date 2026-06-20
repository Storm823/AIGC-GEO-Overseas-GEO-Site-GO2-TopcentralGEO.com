import Link from 'next/link';

/**
 * KeywordCloud — Keyword cloud component
 * Displays AIGC-indexed and AI-adopted keywords, supports cloud/list modes
 *
 * @param {Object[]} keywords - Keyword list
 * @param {string} keywords[].name - Keyword name
 * @param {number} keywords[].count - Occurrence frequency
 * @param {string} keywords[].type - Type ('aigc' | 'ai')
 * @param {string} mode - Display mode ('cloud' | 'list')
 */
export default function KeywordCloud({ keywords = [], mode = 'cloud' }) {
  if (!keywords.length) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 48,
          color: 'var(--text-muted)',
        }}
      >
        No keywords data available
      </div>
    );
  }

  const maxCount = Math.max(...keywords.map((k) => k.count || 1));

  // Calculate font size (cloud mode)
  const getFontSize = (count) => {
    const minSize = 0.75;
    const maxSize = 2.0;
    const ratio = maxCount > 0 ? (count || 1) / maxCount : 0.5;
    return minSize + ratio * (maxSize - minSize);
  };

  // Get color by type
  const getColor = (type) => {
    if (type === 'aigc') return 'var(--accent-cyan)';
    if (type === 'ai') return 'var(--accent-blue-light)';
    return 'var(--text-secondary)';
  };

  if (mode === 'list') {
    // List mode
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {keywords.map((kw) => (
          <Link
            key={kw.name}
            href={`/keywords?q=${encodeURIComponent(kw.name)}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-cyan)';
              e.currentTarget.style.background = 'var(--bg-hover)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.background = 'var(--bg-secondary)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  color: getColor(kw.type),
                  fontWeight: kw.type === 'aigc' ? 700 : 500,
                  fontSize: '0.9rem',
                }}
              >
                {kw.name}
              </span>
              {kw.type === 'aigc' && (
                <span
                  className="tag tag-cyan"
                  style={{ fontSize: '0.65rem', padding: '2px 8px' }}
                >
                  AIGC
                </span>
              )}
              {kw.type === 'ai' && (
                <span
                  className="tag tag-green"
                  style={{ fontSize: '0.65rem', padding: '2px 8px' }}
                >
                  AI
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {kw.count || 0} articles
            </span>
          </Link>
        ))}
      </div>
    );
  }

  // Cloud mode
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px 16px',
        padding: 24,
        minHeight: 200,
      }}
    >
      {keywords.map((kw) => (
        <Link
          key={kw.name}
          href={`/keywords?q=${encodeURIComponent(kw.name)}`}
          style={{
            fontSize: `${getFontSize(kw.count)}rem`,
            color: getColor(kw.type),
            fontWeight: kw.type === 'aigc' ? 700 : 500,
            textDecoration: 'none',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            transition: 'all 0.2s',
            position: 'relative',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(100, 255, 218, 0.08)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {kw.name}
          {kw.type === 'aigc' && (
            <sup
              style={{
                fontSize: '0.4rem',
                color: 'var(--accent-cyan)',
                marginLeft: 2,
              }}
            >
              ✦
            </sup>
          )}
        </Link>
      ))}
    </div>
  );
}
