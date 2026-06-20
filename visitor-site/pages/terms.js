import Head from 'next/head';
import SEOSchema from '../components/SEOSchema';

const LAST_UPDATED = 'June 20, 2026';

const SECTIONS = [
  {
    title: '1. Introduction & Acceptance',
    content: (
      <>
        <p>
          Welcome to <strong>www.TopcentralGEO.com</strong> (the &ldquo;Site&rdquo;), operated by <strong>Topcentral® GEO</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Site, including all content, products, services, and features offered through the Site.
        </p>
        <p>
          By accessing or using the Site, you confirm that you have read, understood, and agree to be bound by these Terms. If you are using the Site on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms. If you do not agree, please do not use the Site.
        </p>
        <p>
          Our Site is a B2B platform serving the plastics recycling and circular economy industry, offering material solutions, product information, and AIGC GEO (Generative Engine Optimization) services for business clients worldwide.
        </p>
      </>
    ),
  },
  {
    title: '2. Services Overview',
    content: (
      <>
        <p>
          Topcentral® GEO provides the following services through the Site:
        </p>
        <ul>
          <li><strong>Circular Material Solutions:</strong> Information and procurement access to recycled plastics, including PCR, PIR, chemical recycling products, biodegradable materials, and general-purpose recycled compounds under our product lines PlasCircles®, CircleBlend®, Bydercom®, ChemCircle®, and TcycleGP®.</li>
          <li><strong>AIGC GEO Services:</strong> Generative Engine Optimization strategies including AI content optimization, cross-platform keyword intelligence, citation building, brand monitoring, and analytics dashboard services.</li>
          <li><strong>Industry Content:</strong> Articles, case studies, technical documentation, and market insights related to circular economy and plastics recycling.</li>
          <li><strong>Product Discovery:</strong> AI-indexed product catalog allowing business users to search and compare recycled plastic materials by type, certification, and application.</li>
        </ul>
        <p>
          All services are provided on an &ldquo;as available&rdquo; basis and are subject to these Terms. Specific services may be governed by separate agreements (e.g., Service Level Agreements for GEO clients), which will be provided at the time of engagement.
        </p>
      </>
    ),
  },
  {
    title: '3. Use of the Site',
    content: (
      <>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem' }}>3.1 Eligibility</h4>
        <p>
          The Site is intended for business and professional use. By using the Site, you represent that you are at least 18 years of age and have the legal capacity to enter into binding contracts. The Site is not intended for individual consumers or personal, non-commercial use.
        </p>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem', marginTop: 16 }}>3.2 Prohibited Uses</h4>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Site for any unlawful purpose or in violation of any applicable local, national, or international law.</li>
          <li>Attempt to gain unauthorized access to any part of the Site, servers, or databases.</li>
          <li>Scrape, crawl, or extract data from the Site without our prior written consent.</li>
          <li>Upload or transmit viruses, malware, or any code designed to disrupt the Site.</li>
          <li>Interfere with or disrupt the operation of the Site or the servers hosting it.</li>
          <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
          <li>Use the Site to send unsolicited commercial communications (spam).</li>
        </ul>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem', marginTop: 16 }}>3.3 Account Registration</h4>
        <p>
          Access to certain features (such as the analytics dashboard or account portal) may require registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.
        </p>
      </>
    ),
  },
  {
    title: '4. Intellectual Property Rights',
    content: (
      <>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem' }}>4.1 Our Content</h4>
        <p>
          All content on the Site, including but not limited to text, graphics, logos, images, videos, product data, patents (82+), trademarks (300+), product line names (PlasCircles®, CircleBlend®, Bydercom®, ChemCircle®, TcycleGP®), software, and data compilations, is the property of Topcentral® GEO or its content suppliers and is protected by applicable intellectual property laws.
        </p>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem', marginTop: 16 }}>4.2 Limited License</h4>
        <p>
          We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Site and its content for your internal business purposes. You may not reproduce, distribute, modify, publicly display, or create derivative works from our content without our express written permission.
        </p>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem', marginTop: 16 }}>4.3 Trademarks</h4>
        <p>
          Topcentral®, PlasCircles®, CircleBlend®, Bydercom®, ChemCircle®, and TcycleGP® are registered or unregistered trademarks of Topcentral® GEO. All other trademarks, service marks, and trade names appearing on the Site are the property of their respective owners.
        </p>
      </>
    ),
  },
  {
    title: '5. Product Information & Disclaimers',
    content: (
      <>
        <p>
          We make every effort to ensure that product information, technical specifications, certifications (GRS, ISCC PLUS, UL 2809, IATF 16949), and material data on the Site are accurate and up to date. However:
        </p>
        <ul>
          <li>Product specifications are provided for informational purposes and may vary by batch. Final specifications should be confirmed in the applicable purchase agreement.</li>
          <li>Certifications and compliance status are subject to periodic re-certification and may change. We recommend verifying current certification status with our team.</li>
          <li>All product information is subject to change without notice. We reserve the right to discontinue or modify products at any time.</li>
          <li>Nothing on this Site constitutes a binding offer. Orders are subject to acceptance by Topcentral® GEO and will be governed by separate terms and conditions of sale.</li>
        </ul>
      </>
    ),
  },
  {
    title: '6. AIGC GEO Services — Additional Terms',
    content: (
      <>
        <p>
          If you engage our AIGC GEO services, the following additional terms apply:
        </p>
        <ul>
          <li>We do not guarantee specific AI citation rates, ranking positions, or traffic volumes as AI engine algorithms are proprietary and change frequently.</li>
          <li>Our services are based on publicly available AI engine outputs and industry best practices. Results vary across platforms (ChatGPT, Claude, Gemini, Perplexity, DeepSeek, etc.).</li>
          <li>You retain ownership of your brand content; we claim no intellectual property rights over your materials beyond the scope of the engagement.</li>
          <li>Service scope, deliverables, pricing, and timelines will be defined in a separate Statement of Work (SOW) or service agreement.</li>
        </ul>
      </>
    ),
  },
  {
    title: '7. Limitation of Liability',
    content: (
      <>
        <p>
          To the fullest extent permitted by law:
        </p>
        <ul>
          <li>The Site and all content, products, and services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</li>
          <li>Topcentral® GEO shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Site, including but not limited to loss of profits, data, or business opportunities.</li>
          <li>Our total liability for any claim arising from these Terms shall not exceed the amount paid by you (if any) to Topcentral® GEO in the twelve (12) months preceding the claim.</li>
          <li>We are not liable for any interruption, delay, or failure in the operation of the Site due to causes beyond our reasonable control, including acts of God, network failures, or third-party service disruptions.</li>
        </ul>
      </>
    ),
  },
  {
    title: '8. Indemnification',
    content: (
      <>
        <p>
          You agree to indemnify, defend, and hold harmless Topcentral® GEO, its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to:
        </p>
        <ul>
          <li>Your use of the Site in violation of these Terms.</li>
          <li>Your violation of any third-party rights, including intellectual property or privacy rights.</li>
          <li>Any content or materials you submit through the Site.</li>
        </ul>
      </>
    ),
  },
  {
    title: '9. Third-Party Links & Content',
    content: (
      <>
        <p>
          The Site may contain links to third-party websites, platforms, or resources. We provide these links for convenience only and do not endorse or assume responsibility for the content, products, or services available on those sites. Your interactions with third-party sites are governed by their own terms and policies.
        </p>
        <p>
          Our Site indexes product information across third-party AIGC platforms. We do not control how those platforms display or rank our content and disclaim any liability for AI-generated outputs referencing Topcentral® GEO.
        </p>
      </>
    ),
  },
  {
    title: '10. Privacy & Data Protection',
    content: (
      <>
        <p>
          Your use of the Site is also governed by our <a href="/privacy" style={{ color: 'var(--accent-cyan)' }}>Privacy Policy</a>, which explains how we collect, use, and protect your personal data. By using the Site, you consent to the data practices described in that policy.
        </p>
        <p>
          Our servers are located in Singapore. Data we collect may be processed in or transferred to Singapore in accordance with our Privacy Policy and applicable data protection laws.
        </p>
      </>
    ),
  },
  {
    title: '11. Termination',
    content: (
      <>
        <p>
          We reserve the right to suspend or terminate your access to the Site or any portion thereof at any time, without prior notice, for any reason, including but not limited to:
        </p>
        <ul>
          <li>Violation of these Terms.</li>
          <li>Engagement in prohibited uses described in Section 3.</li>
          <li>Extended inactivity of your account.</li>
          <li>Technical or security concerns.</li>
        </ul>
        <p>
          Upon termination, your right to use the Site ceases immediately. Provisions of these Terms that by their nature should survive termination (including intellectual property, disclaimers, limitation of liability, and governing law) shall survive.
        </p>
      </>
    ),
  },
  {
    title: '12. Governing Law & Dispute Resolution',
    content: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Singapore, without regard to its conflict of law provisions. The servers hosting the Site are located in Singapore.
        </p>
        <p>
          Any disputes arising out of or relating to these Terms or the use of the Site shall first be resolved through good-faith negotiations. If the dispute cannot be resolved within 30 days, either party may submit the matter to binding arbitration in Singapore, administered by the Singapore International Arbitration Centre (SIAC) in accordance with its rules. The language of arbitration shall be English.
        </p>
        <p>
          Notwithstanding the foregoing, either party may seek injunctive relief from a court of competent jurisdiction to protect its intellectual property rights or confidential information.
        </p>
      </>
    ),
  },
  {
    title: '13. Changes to These Terms',
    content: (
      <>
        <p>
          We reserve the right to update or modify these Terms at any time. Material changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date. Your continued use of the Site after the effective date of any changes constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.
        </p>
      </>
    ),
  },
  {
    title: '14. Contact Information',
    content: (
      <>
        <p>
          If you have any questions, concerns, or requests regarding these Terms, please contact us:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@topcentral.cn" style={{ color: 'var(--accent-cyan)' }}>info@topcentral.cn</a></li>
          <li><strong>Website:</strong> <a href="https://www.TopcentralGEO.com" style={{ color: 'var(--accent-cyan)' }}>www.TopcentralGEO.com</a></li>
          <li><strong>Company:</strong> Topcentral® GEO</li>
        </ul>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service | Topcentral® GEO — B2B Circular Economy & AIGC GEO Services</title>
        <meta
          name="description"
          content="Topcentral® GEO Terms of Service governing the use of www.TopcentralGEO.com for B2B plastics recycling and AIGC GEO services. Singapore law, SIAC arbitration."
        />
        <meta name="keywords" content="Topcentral Terms of Service,Terms,Conditions,B2B,Legal,GEO Services,TopcentralGEO" />
        <link rel="canonical" href="https://www.TopcentralGEO.com/terms" />
        <meta property="og:title" content="Terms of Service | Topcentral® GEO" />
        <meta property="og:description" content="Terms of Service for Topcentral® GEO — B2B circular economy and AIGC GEO services." />
      </Head>
      <SEOSchema
        type="WebPage"
        title="Terms of Service | Topcentral® GEO"
        description="Topcentral® GEO Terms of Service — B2B circular economy materials and AIGC GEO services."
        url="https://www.TopcentralGEO.com/terms"
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
              marginBottom: 12,
            }}
          >
            <span className="gradient-text">Terms of Service</span>
          </h1>
          <p
            style={{
              maxWidth: 600,
              margin: '0 auto',
              fontSize: '1rem',
              color: 'var(--text-muted)',
            }}
          >
            Please read these terms carefully before using Topcentral® GEO services or the website.
          </p>
          <div
            style={{
              marginTop: 20,
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            Last Updated: {LAST_UPDATED}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container">
          <div
            style={{
              maxWidth: 800,
              margin: '0 auto',
            }}
          >
            {SECTIONS.map((section, i) => (
              <div
                key={i}
                className="card"
                style={{
                  marginBottom: 24,
                  cursor: 'default',
                  padding: '24px 28px',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.15rem',
                    marginBottom: 16,
                    color: 'var(--accent-cyan)',
                  }}
                >
                  {section.title}
                </h2>
                <div
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.8,
                  }}
                >
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section" style={{ background: 'var(--bg-secondary)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: 12 }}>Questions About These Terms?</h2>
          <p
            style={{
              maxWidth: 500,
              margin: '0 auto 28px',
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
            }}
          >
            If you have any questions or concerns about our Terms of Service, please contact us.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div
              className="card"
              style={{
                cursor: 'default',
                padding: '16px 28px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Email Us
              </div>
              <a
                href="mailto:info@topcentral.cn"
                style={{
                  fontSize: '1rem',
                  color: 'var(--accent-cyan)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                info@topcentral.cn
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
