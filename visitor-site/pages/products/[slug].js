import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEOSchema from '../../components/SEOSchema';
import { PRODUCT_LINES } from '../../data/products';

export default function ProductDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Find the product by slug
  const product = PRODUCT_LINES.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ marginBottom: 24 }}>Please check our other product lines.</p>
        <Link href="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} | Topcentral® GEO — {product.tagline}</title>
        <meta name="description" content={`${product.name} — ${product.description.substring(0, 160)}`} />
        <meta name="keywords" content={`Topcentral,${product.name.replace(/[®]/g, '')},${product.category},Circular Materials,${product.certifications.join(',')}`} />
        <link rel="canonical" href={`https://www.TopcentralGEO.com/products/${product.slug}`} />
        <meta property="og:title" content={`${product.name} | Topcentral® GEO`} />
        <meta property="og:description" content={product.tagline} />
      </Head>
      <SEOSchema
        product={{
          name: product.name,
          description: product.tagline,
          brand: 'Topcentral® GEO',
          category: product.category,
        }}
        breadcrumb={[
          { name: 'Home', url: 'https://www.TopcentralGEO.com' },
          { name: 'Products & Applications', url: 'https://www.TopcentralGEO.com/products' },
          { name: product.name, url: `https://www.TopcentralGEO.com/products/${product.slug}` },
        ]}
      />

      {/* Breadcrumb */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 0',
          fontSize: '0.8rem',
        }}
      >
        <div className="container" style={{ display: 'flex', gap: 8, color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: 'var(--text-muted)' }}>Products & Applications</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent-cyan)' }}>{product.name}</span>
        </div>
      </div>

      {/* Product Header */}
      <section
        style={{
          padding: '48px 0',
          background: `linear-gradient(180deg, ${product.color}08 0%, var(--bg-primary) 100%)`,
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Icon */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: `${product.color}15`,
                border: `2px solid ${product.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                flexShrink: 0,
              }}
            >
              {product.icon}
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontSize: '2rem',
                    color: product.color,
                    margin: 0,
                  }}
                >
                  {product.name}
                </h1>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 12px',
                    borderRadius: 12,
                    background: `${product.color}15`,
                    color: product.color,
                    border: `1px solid ${product.color}30`,
                  }}
                >
                  {product.tier}
                </span>
              </div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 400,
                  marginBottom: 16,
                }}
              >
                {product.tagline}
              </h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  color: 'var(--text-muted)',
                }}
              >
                {product.description}
              </p>

              {/* Certifications */}
              <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                {product.certifications.map((cert) => (
                  <span key={cert} className="tag tag-green">
                    ✓ {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container" style={{ padding: '48px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {/* Left: Highlights */}
          <div>
            <h3 style={{ marginBottom: 24, fontSize: '1.3rem' }}>Core Strengths</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {product.details.specialties.map((specialty) => (
                <div
                  key={specialty}
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: `1px solid ${product.color}20`,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: product.color,
                      marginBottom: 6,
                      fontSize: '0.95rem',
                    }}
                  >
                    {specialty}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Specs & Applications */}
          <div>
            <h3 style={{ marginBottom: 24, fontSize: '1.3rem' }}>Process & Applications</h3>
            {product.details.process && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  marginBottom: 24,
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                }}
              >
                <strong style={{ color: 'var(--accent-cyan)' }}>Process: </strong>
                {product.details.process}
              </div>
            )}

            {/* Use Cases */}
            {product.details.useCases && product.details.useCases.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {product.details.useCases.map((uc) => (
                  <div
                    key={uc.title}
                    style={{
                      padding: 14,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: product.color, marginBottom: 4 }}>
                      {uc.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {uc.desc}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Applications */}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Application Areas</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.applications.map((app) => (
                  <span key={app} className="tag" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <Link href="/products" className="btn btn-outline">
            ← Back to Products
          </Link>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = PRODUCT_LINES.map((p) => ({
    params: { slug: p.slug },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {},
  };
}
