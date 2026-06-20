import Head from 'next/head';
import Link from 'next/link';
import SEOSchema from '../components/SEOSchema';

// ─── AIGC GEO Service Lines ─────────────────────────────────────────────────
const SERVICES = [
  {
    slug: 'ai-content-optimization',
    name: 'AI Content Optimization',
    tagline: 'Optimize for AI Engine Discovery',
    description:
      'Craft and structure content that AI engines like ChatGPT, Claude, and Gemini actively index and reference. Our proprietary framework ensures your brand appears as a trusted source in AI-generated answers.',
    icon: '✍️',
    color: '#4a9eff',
    features: ['Structured data optimization', 'AI-friendly content templates', 'Multi-model formatting'],
  },
  {
    slug: 'keyword-intelligence',
    name: 'Keyword Intelligence',
    tagline: 'Cross-Platform AI Keyword Analysis',
    description:
      'Discover which keywords and phrases drive AI citations across all major engines. Track how queries trigger your brand in GPT-4o, Claude, Grok, Gemini, Perplexity, and DeepSeek simultaneously.',
    icon: '🔍',
    color: '#00e676',
    features: ['Cross-engine keyword tracking', 'AI citation gap analysis', 'Trending query alerts'],
  },
  {
    slug: 'geo-analytics',
    name: 'GEO Analytics',
    tagline: 'AI Citation Tracking & Closed-Loop Validation',
    description:
      'Measure your Generative Engine Optimization performance with precision. Monitor citation counts, sentiment, share of voice, and attribution across all AI platforms in a single dashboard.',
    icon: '📊',
    color: '#64ffda',
    features: ['Real-time citation monitoring', 'Competitive benchmarking', 'ROI attribution reports'],
  },
  {
    slug: 'agent-platform',
    name: 'Agent Platform',
    tagline: 'AI Agent-Driven Automated GEO Operations',
    description:
      'Deploy intelligent AI agents that continuously optimize your content strategy, monitor citation changes, and autonomously adjust your GEO tactics — scaling your AI presence 24/7.',
    icon: '🤖',
    color: '#b388ff',
    features: ['Autonomous content agents', 'Scheduled GEO audits', 'Multi-engine orchestration'],
  },
  {
    slug: 'smart-monitoring',
    name: 'Smart Monitoring',
    tagline: 'Real-Time AI Indexing Alerts',
    description:
      'Stay informed the moment your content gets indexed or de-indexed by any AI engine. Smart Monitoring provides instant alerts, historical trends, and actionable insights to protect your AI visibility.',
    icon: '📡',
    color: '#ffab00',
    features: ['Instant index change alerts', 'Historical trend analysis', 'Compliance & brand safety checks'],
  },
];

// ─── AIGC Engines (Connected via OpenRouter) ────────────────────────────────
const AIGC_ENGINES = [
  { name: 'GPT-4o', provider: 'OpenAI', color: '#10a37f', icon: '⚡' },
  { name: 'Claude', provider: 'Anthropic', color: '#d97757', icon: '🟤' },
  { name: 'Grok', provider: 'xAI', color: '#1da1f2', icon: '✕' },
  { name: 'Gemini', provider: 'Google DeepMind', color: '#4285f4', icon: '◆' },
  { name: 'Perplexity', provider: 'Perplexity AI', color: '#1e3a5f', icon: '⌕' },
  { name: 'DeepSeek', provider: 'DeepSeek', color: '#4f6ef7', icon: '🔄' },
];

// ─── Core Platform Stats ────────────────────────────────────────────────────
const CORE_STATS = [
  { value: '12+', label: 'Platforms Monitored', color: '#4a9eff' },
  { value: '50K+', label: 'Keywords Tracked', color: '#64ffda' },
  { value: '2.5M+', label: 'AI Citations', color: '#00e676' },
  { value: '200+', label: 'Active Agents', color: '#b388ff' },
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Topcentral® GEO — Power Your Presence in the AI Era | AIGC GEO Platform</title>
        <meta
          name="description"
          content="Topcentral® GEO is the leading AIGC GEO (Generative Engine Optimization) platform. Optimize your brand's visibility across ChatGPT, Claude, Grok, Gemini, Perplexity, and DeepSeek."
        />
        <meta
          name="keywords"
          content="AIGC, GEO, Generative Engine Optimization, AI SEO, ChatGPT optimization, Claude optimization, AI content, Topcentral® GEO"
        />
        <link rel="canonical" href="https://www.TopcentralGEO.com" />
        <meta property="og:title" content="Topcentral® GEO — Power Your Presence in the AI Era" />
        <meta
          property="og:description"
          content="AIGC GEO platform: 12+ platforms monitored · 50K+ keywords tracked · 2.5M+ AI citations · 200+ active agents"
        />
        <meta property="og:url" content="https://www.TopcentralGEO.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Topcentral® GEO" />
      </Head>
      <SEOSchema
        type="WebPage"
        title="Topcentral® GEO — Power Your Presence in the AI Era | AIGC GEO Platform"
        description="Topcentral® GEO is the leading AIGC GEO (Generative Engine Optimization) platform. Optimize your brand's visibility across ChatGPT, Claude, Grok, Gemini, Perplexity, and DeepSeek."
        url="https://www.TopcentralGEO.com"
      />

      {/* ======================== HERO SECTION ======================== */}
      <section
        style={{
          position: 'relative',
          minHeight: 'calc(100vh - 68px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '80px 24px',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: -250,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(74,158,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(100,255,218,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 960,
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Brand badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 18px',
              borderRadius: 20,
              background: 'rgba(100, 255, 218, 0.08)',
              border: '1px solid var(--border-cyan)',
              marginBottom: 32,
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
            }}
          >
            <span style={{ fontSize: 16 }}>✦</span>
            AIGC GEO — Generative Engine Optimization
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 20,
              letterSpacing: '-0.03em',
            }}
          >
            <span className="gradient-text">
              Topcentral® GEO
            </span>
            <br />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
              Power Your Presence in the AI Era
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              maxWidth: 680,
              margin: '0 auto 40px',
              lineHeight: 1.7,
            }}
          >
            Dominate AI-generated answers. Topcentral® GEO optimizes your brand for
            ChatGPT, Claude, Grok, Gemini, Perplexity, and DeepSeek — turning AI
            engines into your most powerful discovery channel.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/products"
              className="btn btn-primary"
              style={{ fontSize: '1rem', padding: '14px 36px' }}
            >
              Explore Services →
            </Link>
            <Link
              href="/articles"
              className="btn btn-outline"
              style={{ fontSize: '1rem', padding: '14px 36px' }}
            >
              GEO Insights
            </Link>
          </div>

          {/* Core Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 40,
              marginTop: 60,
              flexWrap: 'wrap',
            }}
          >
            {CORE_STATS.map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== SERVICES ======================== */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Our Services</h2>
            <p>
              End-to-end AIGC GEO solutions engineered for the multi-model AI landscape
            </p>
          </div>

          <div className="grid-3" style={{ gap: 24 }}>
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/products/${service.slug}`}
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
                  {/* Top accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${service.color}, var(--accent-cyan))`,
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
                        background: `${service.color}15`,
                        border: `1px solid ${service.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        flexShrink: 0,
                      }}
                    >
                      {service.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: '1.1rem',
                          color: 'var(--text-primary)',
                          marginBottom: 4,
                        }}
                      >
                        {service.name}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: service.color,
                          fontWeight: 500,
                          margin: 0,
                        }}
                      >
                        {service.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                      flex: 1,
                      marginBottom: 16,
                    }}
                  >
                    {service.description}
                  </p>

                  {/* Features */}
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
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="tag"
                        style={{
                          fontSize: '0.65rem',
                          background: `${service.color}12`,
                          color: service.color,
                          borderColor: `${service.color}25`,
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/products" className="btn btn-primary">
              View All Service Details →
            </Link>
          </div>
        </div>
      </section>

      {/* ======================== AIGC ENGINES ======================== */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>AI Engines Covered</h2>
            <p>
              Unified optimization across all major AI platforms via OpenRouter
            </p>
          </div>

          <div className="grid-3" style={{ gap: 20 }}>
            {AIGC_ENGINES.map((engine) => (
              <div
                key={engine.name}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'default',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${engine.color}20`,
                    border: `1px solid ${engine.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: engine.color,
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {engine.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {engine.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {engine.provider}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== WHY TOPCENTRALGEO ======================== */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Why Topcentral® GEO?</h2>
            <p>The unified platform for multi-engine AI visibility</p>
          </div>

          <div className="grid-4" style={{ gap: 20 }}>
            {[
              {
                icon: '🌐',
                title: 'Multi-Engine Coverage',
                desc: 'One platform to optimize for GPT-4o, Claude, Grok, Gemini, Perplexity, DeepSeek and more.',
              },
              {
                icon: '📊',
                title: 'Data-Driven Insights',
                desc: 'Real-time analytics showing exactly how AI engines perceive and cite your brand.',
              },
              {
                icon: '🤖',
                title: 'AI-Powered Agents',
                desc: 'Autonomous agents that continuously refine your GEO strategy around the clock.',
              },
              {
                icon: '🔒',
                title: 'Closed-Loop Validation',
                desc: 'Track the full journey from optimization → indexing → citation → traffic attribution.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card"
                style={{
                  textAlign: 'center',
                  cursor: 'default',
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    marginBottom: 16,
                  }}
                >
                  {item.icon}
                </div>
                <h4
                  style={{
                    fontSize: '0.95rem',
                    marginBottom: 8,
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== CTA SECTION ======================== */}
      <section
        className="section"
        style={{
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(74,158,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontSize: '2rem',
              marginBottom: 16,
              color: 'var(--text-primary)',
            }}
          >
            Ready to Power Your AI Presence?
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              maxWidth: 520,
              margin: '0 auto 32px',
            }}
          >
            Join the leading brands using Topcentral® GEO to dominate
            AI-generated answers and turn generative engines into your growth
            channel.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Link href="/about" className="btn btn-primary">
              Get Started
            </Link>
            <Link href="/articles" className="btn btn-outline">
              Read the Blog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
