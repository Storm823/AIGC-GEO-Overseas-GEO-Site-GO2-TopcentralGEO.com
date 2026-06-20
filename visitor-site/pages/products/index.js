import Head from 'next/head';
import { useState } from 'react';
import SEOSchema from '../../components/SEOSchema';
import ProductCard from '../../components/ProductCard';
import { PRODUCT_LINES, INDUSTRY_CASES } from '../../data/products';

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <>
      <Head>
        <title>Products & Applications | Topcentral® GEO — Product Lines & Industry Solutions</title>
        <meta
          name="description"
          content={`Topcentral® GEO product lines: ${PRODUCT_LINES.map(p => p.name).join(', ')}. Covering automotive, electronics, packaging, and other industries.`}
        />
        <meta name="keywords" content={`Topcentral,Products,${PRODUCT_LINES.map(p => p.name.replace(/[®]/g, '')).join(',')},Industry Applications`} />
        <link rel="canonical" href="https://www.TopcentralGEO.com/products" />
        <meta property="og:title" content="Products & Applications | Topcentral® GEO" />
        <meta property="og:description" content={`${PRODUCT_LINES.length} Product Lines · Industry Solutions`} />
      </Head>
      <SEOSchema
        type="CollectionPage"
        title="Products & Applications | Topcentral® GEO"
        description="Topcentral® GEO product lines and industry application solutions"
        url="https://www.TopcentralGEO.com/products"
      />

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          padding: '60px 24px 40px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 20,
              background: 'rgba(100, 255, 218, 0.08)',
              border: '1px solid var(--border-cyan)',
              marginBottom: 24,
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
            }}
          >
            ♻️ {PRODUCT_LINES.length} Product Lines · Industry Applications
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 12 }}>
            <span className="gradient-text">Products & Applications</span>
          </h1>
          <p
            style={{
              maxWidth: 650,
              margin: '0 auto',
              fontSize: '1.05rem',
              color: 'var(--text-muted)',
            }}
          >
            From PCR physical recycling, chemical recycling to bio-based degradation, Topcentral<sup>®</sup> provides comprehensive circular material solutions
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div
        style={{
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          position: 'sticky',
          top: 'var(--header-height)',
          zIndex: 10,
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            gap: 0,
          }}
        >
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '14px 28px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'products' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: activeTab === 'products' ? 600 : 400,
              fontSize: '0.95rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'products' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Product Lines
          </button>
          <button
            onClick={() => setActiveTab('solutions')}
            style={{
              padding: '14px 28px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'solutions' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: activeTab === 'solutions' ? 600 : 400,
              fontSize: '0.95rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'solutions' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Industry Applications
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* ========== Products Tab ========== */}
        {activeTab === 'products' && (
          <>
            {/* Product Line Cards */}
            <div className="grid-3" style={{ gap: 24, marginBottom: 60 }}>
              {PRODUCT_LINES.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>

            {/* Technology Comparison Table */}
            <section>
              <h2
                style={{
                  fontSize: '1.6rem',
                  marginBottom: 32,
                  textAlign: 'center',
                }}
              >
                Product Line <span className="gradient-text">Technology Comparison</span>
              </h2>

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.85rem',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '2px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product Line</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Core Technology</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Certifications</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Typical Applications</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Environmental Benefit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCT_LINES.map((p) => (
                      <tr
                        key={p.slug}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td
                          style={{
                            padding: '14px 16px',
                            fontWeight: 600,
                            color: p.color,
                          }}
                        >
                          {p.name}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          {p.details.specialties.slice(0, 3).join(', ')}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {p.certifications.map((cert) => (
                              <span key={cert} className="tag tag-green" style={{ fontSize: '0.7rem' }}>
                                {cert}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {p.applications.slice(0, 3).join(', ')}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                          Carbon Reduction 30-50%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ========== Industry Solutions Tab ========== */}
        {activeTab === 'solutions' && (
          <div className="grid-2" style={{ gap: 28 }}>
            {INDUSTRY_CASES.map((c) => (
              <div
                key={c.industry}
                className="card"
                style={{
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 32,
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: 4 }}>{c.industry}</h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {c.products.map((p) => (
                        <span key={p} className="tag tag-cyan" style={{ fontSize: '0.7rem' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                  {c.description}
                </p>

                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--accent-green)',
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Key Benefits
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {c.benefits.map((b) => (
                      <span
                        key={b}
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-secondary)',
                          padding: '3px 10px',
                          borderRadius: 12,
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
