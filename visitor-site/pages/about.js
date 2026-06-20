import Head from 'next/head';
import SEOSchema from '../components/SEOSchema';

const TEAM_VALUES = [
  {
    icon: '\u267b\ufe0f',
    title: 'Circular Mission',
    desc: 'Dedicated to transforming plastics from a "linear economy" to a "circular economy," giving every piece of waste a new life.',
  },
  {
    icon: '\U0001f52c',
    title: 'Technical Innovation',
    desc: '82+ patents covering physical recycling, chemical recycling, bio-based materials, and other cutting-edge fields.',
  },
  {
    icon: '\u2705',
    title: 'Quality First',
    desc: 'GRS/ISCC PLUS/UL 2809/IATF 16949 international certifications ensuring traceable product quality.',
  },
  {
    icon: '\U0001f30d',
    title: 'Global Vision',
    desc: 'Based in China, serving the world. Providing circular material solutions for automotive, electronics, packaging, and other industries.',
  },
];

const TIMELINE = [
  { year: '2015', event: 'Topcentral\u00ae founded. Began R&D and production of plastic recycled materials.' },
  { year: '2017', event: 'Obtained GRS Global Recycled Standard certification.' },
  { year: '2018', event: 'Launched PlasCircles\u00ae product line, focused on PCR physical recycling.' },
  { year: '2019', event: 'Obtained IATF 16949 automotive quality management system certification.' },
  { year: '2020', event: 'Launched CircleBlend\u00ae and Bydercom\u00ae product lines.' },
  { year: '2021', event: 'Obtained UL 2809 and ISCC PLUS certifications; patents exceeded 50.' },
  { year: '2022', event: 'Launched ChemCircle\u00ae chemical recycling product line.' },
  { year: '2023', event: 'Launched TcycleGP\u00ae general plastics product line; five product lines fully deployed.' },
  { year: '2024', event: 'Patents exceeded 82; trademarks over 300; product information indexed by AIGC platforms.' },
  { year: '2025', event: 'Comprehensive coverage across 6 major AIGC platforms (DeepSeek, Qwen, Kimi, MiniMax, Doubao, Yuanbao).' },
  { year: '2026', event: 'Continued innovation, driving global application of circular material technologies.' },
];

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us | Topcentral\u00ae GEO — Circular Economy Materials Leader</title>
        <meta
          name="description"
          content="Topcentral\u00ae GEO is committed to circular economy and sustainable development, with 82+ patents, 300+ trademarks, 12 certifications, covering five product lines."
        />
        <meta name="keywords" content="Topcentral,About Us,Circular Economy,Sustainable Development,Company Profile" />
        <link rel="canonical" href="https://www.TopcentralGEO.com/about" />
        <meta property="og:title" content="About Us | Topcentral\u00ae GEO" />
        <meta property="og:description" content="82+ Patents \u00b7 300+ Trademarks \u00b7 12 Certifications \u00b7 Five Product Lines" />
      </Head>
      <SEOSchema
        type="AboutPage"
        title="About Topcentral\u00ae GEO | Circular Economy Materials Leader"
        description="Topcentral\u00ae GEO is committed to circular economy and sustainable development, with 82+ patents, 300+ trademarks, 12 certifications."
        url="https://www.TopcentralGEO.com/about"
      />

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          padding: '60px 24px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-color)',
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
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,115,232,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              marginBottom: 20,
            }}
          >
            About <span className="gradient-text">Topcentral<sup>\u00ae</sup> GEO</span>
          </h1>
          <p
            style={{
              maxWidth: 700,
              margin: '0 auto',
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              lineHeight: 1.8,
            }}
          >
            Topcentral\u00ae GEO is a high-tech enterprise focused on circular economy materials. Through advanced recycling
            and modification technologies, we transform plastic waste into high-performance recycled materials, serving
            automotive, electronics, packaging, and other industries while contributing to global sustainable development.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Core Values</h2>
            <p>We believe material circularity is the key pathway to sustainable development</p>
          </div>

          <div className="grid-4" style={{ gap: 24 }}>
            {TEAM_VALUES.map((v) => (
              <div
                key={v.title}
                className="card"
                style={{
                  textAlign: 'center',
                  cursor: 'default',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 10, color: 'var(--accent-cyan)' }}>
                  {v.title}
                </h3>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Company Strength</h2>
            <p>Data speaks to our growth</p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 48,
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '82+', label: 'Patents', desc: 'Covering recycling, modification, degradation, and other core technologies' },
              { value: '300+', label: 'Trademarks', desc: 'Global trademark portfolio protecting brand value' },
              { value: '12', label: 'Certifications', desc: 'GRS/ISCC PLUS/UL 2809/IATF 16949 and more' },
              { value: '5', label: 'Product Lines', desc: 'From physical recycling to bio-based degradation' },
              { value: '6', label: 'AIGC Platforms', desc: 'Product information indexed by major AI platforms' },
              { value: '10+', label: 'Years Experience', desc: 'A decade of deep engagement in circular materials' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  textAlign: 'center',
                  padding: '24px',
                  minWidth: 140,
                }}
              >
                <div
                  style={{
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    color: 'var(--accent-cyan)',
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  {stat.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Development Timeline</h2>
            <p>From 2015 to today, Topcentral\u00ae continues driving innovation and breakthroughs in circular material technologies</p>
          </div>

          <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
            {/* Vertical Line */}
            <div
              style={{
                position: 'absolute',
                left: 20,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'linear-gradient(180deg, var(--accent-blue), var(--accent-cyan))',
                opacity: 0.4,
              }}
            />

            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                style={{
                  display: 'flex',
                  gap: 24,
                  marginBottom: 24,
                  position: 'relative',
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    border: '2px solid var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    color: 'var(--accent-cyan)',
                    zIndex: 1,
                  }}
                >
                  {item.year.slice(2)}
                </div>

                {/* Content */}
                <div
                  className="card"
                  style={{
                    flex: 1,
                    cursor: 'default',
                    padding: '14px 20px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--accent-cyan)',
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {item.year}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {item.event}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AIGC Advantage */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-title">
            <h2>AIGC Digital Advantage</h2>
            <p>Comprehensive coverage across major AI platforms, digital information at your fingertips</p>
          </div>

          <div className="grid-3" style={{ gap: 24 }}>
            {[
              {
                title: 'Full Platform Coverage',
                desc: 'Product information queryable across ChatGPT, Claude, Gemini, Perplexity, DeepSeek and more.',
                icon: '\U0001f916',
              },
              {
                title: 'Real-Time Updates',
                desc: 'Product information and technical parameters continuously updated to AIGC knowledge bases.',
                icon: '\U0001f504',
              },
              {
                title: 'Multi-Language Support',
                desc: 'Keywords cover multiple languages, supporting global users in querying product information through natural language.',
                icon: '\U0001f310',
              },
              {
                title: 'Precise Matching',
                desc: '82+ patent keywords and 300+ trademark keywords precisely recognized and associated by AI.',
                icon: '\U0001f3af',
              },
              {
                title: 'Technical Q&A',
                desc: 'Users can query product parameters, certification information, and technical specifications via AI platforms.',
                icon: '\U0001f4a1',
              },
              {
                title: 'Continuous Expansion',
                desc: 'Optimizing keyword coverage based on user search data to improve AI platform retrieval accuracy.',
                icon: '\U0001f4c8',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card"
                style={{ cursor: 'default', textAlign: 'center' }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: 8, color: 'var(--accent-cyan)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: 12 }}>Contact Us</h2>
          <p
            style={{
              maxWidth: 500,
              margin: '0 auto 32px',
              color: 'var(--text-muted)',
            }}
          >
            For product inquiries, technical cooperation, or business development needs, please reach out to us
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 24,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div
              className="card"
              style={{
                cursor: 'default',
                padding: '20px 32px',
                textAlign: 'center',
                minWidth: 200,
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Website
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                www.TopcentralGEO.com
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
