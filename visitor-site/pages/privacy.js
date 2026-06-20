import Head from 'next/head';
import SEOSchema from '../components/SEOSchema';

const LAST_UPDATED = 'June 20, 2026';

const SECTIONS = [
  {
    title: '1. Introduction',
    content: (
      <>
        <p>
          Topcentral® GEO (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy and is committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>www.TopcentralGEO.com</strong> (the &ldquo;Site&rdquo;), including any products or services offered through the Site.
        </p>
        <p>
          We operate as a B2B provider of circular economy material solutions, plastics recycling technologies, and AIGC GEO (Generative Engine Optimization) services for industrial clients. This policy applies to all visitors, customers, and users of the Site.
        </p>
        <p>
          Our servers are located in Singapore. By using the Site, you acknowledge the transfer and processing of your personal data in Singapore as described in this policy.
        </p>
        <p>
          Please read this policy carefully. If you do not agree with our practices, do not access or use the Site.
        </p>
      </>
    ),
  },
  {
    title: '2. Information We Collect',
    content: (
      <>
        <p>We may collect the following categories of personal information when you interact with our Site:</p>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem' }}>2.1 Information You Provide Directly</h4>
        <ul>
          <li><strong>Contact Information:</strong> Name, email address, phone number, company name, job title, and country/region when you fill out contact forms, request quotes, or subscribe to newsletters.</li>
          <li><strong>Inquiry Details:</strong> Messages, product interests, technical requirements, and any attachments you submit through our contact or inquiry forms.</li>
          <li><strong>Account Information:</strong> If you register for an account or dashboard access, we collect your login credentials, company details, and usage preferences.</li>
        </ul>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem', marginTop: 16 }}>2.2 Information Collected Automatically</h4>
        <ul>
          <li><strong>Usage Data:</strong> Pages visited, time spent on the Site, click patterns, referral sources, browser type, device type, operating system, and IP address.</li>
          <li><strong>Cookies & Similar Technologies:</strong> We use cookies, web beacons, and local storage to improve your experience, analyze usage, and provide personalized content. See Section 7 for details.</li>
        </ul>
      </>
    ),
  },
  {
    title: '3. How We Use Your Information',
    content: (
      <>
        <p>We use your personal data for the following purposes:</p>
        <ul>
          <li>To respond to your inquiries, provide quotes, and deliver requested products or services.</li>
          <li>To communicate with you about our circular material solutions, GEO services, and industry insights that may be relevant to your business.</li>
          <li>To improve and personalize the Site experience, including AI-driven recommendations and content delivery.</li>
          <li>To comply with legal obligations, resolve disputes, and enforce our agreements.</li>
          <li>To analyze usage trends and optimize our marketing and SEO strategies.</li>
          <li>To detect, prevent, and address technical issues, fraud, or security breaches.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          <strong>Legal Basis (GDPR):</strong> If you are located in the European Economic Area (EEA) or the United Kingdom, our processing of your personal data is based on one or more of the following lawful bases: (a) your consent; (b) performance of a contract with you; (c) our legitimate business interests; or (d) compliance with a legal obligation.
        </p>
      </>
    ),
  },
  {
    title: '4. How We Share Your Information',
    content: (
      <>
        <p>We do not sell your personal data. We may share your information in the following circumstances:</p>
        <ul>
          <li><strong>Service Providers:</strong> With trusted third-party vendors who assist us in operating the Site, processing inquiries, hosting (Singapore-based servers), analytics, email delivery, and customer relationship management — all under strict data processing agreements.</li>
          <li><strong>Legal Compliance:</strong> When required by law, court order, or governmental regulation, or to protect our rights, property, or safety.</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction, with prior notice to you.</li>
          <li><strong>With Your Consent:</strong> In any other situation where you have expressly authorized the disclosure.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          <strong>International Transfers:</strong> Your data is primarily processed on servers located in Singapore. If we transfer your data to other jurisdictions, we ensure appropriate safeguards (such as Standard Contractual Clauses) are in place.
        </p>
      </>
    ),
  },
  {
    title: '5. Data Retention',
    content: (
      <>
        <p>
          We retain your personal data only as long as necessary to fulfill the purposes described in this policy, or as required by applicable law. Generally:
        </p>
        <ul>
          <li>Contact inquiry data is retained for up to 3 years after the last interaction.</li>
          <li>Usage analytics data is retained in aggregated form for up to 2 years.</li>
          <li>Data related to contractual agreements is retained for the duration of the contract plus 5 years.</li>
        </ul>
        <p>
          When retention is no longer required, your personal data will be securely deleted or anonymized.
        </p>
      </>
    ),
  },
  {
    title: '6. Your Rights (GDPR & CCPA)',
    content: (
      <>
        <p>Depending on your jurisdiction, you have the following rights regarding your personal data:</p>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem' }}>GDPR Rights (EEA & UK Residents)</h4>
        <ul>
          <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
          <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of your personal data under certain conditions.</li>
          <li><strong>Right to Restrict Processing:</strong> Request restriction of processing under certain circumstances.</li>
          <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service provider in a structured, machine-readable format.</li>
          <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing.</li>
          <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.</li>
        </ul>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem', marginTop: 16 }}>CCPA Rights (California Residents)</h4>
        <ul>
          <li><strong>Right to Know:</strong> Request disclosure of the categories and specific pieces of personal information we have collected about you.</li>
          <li><strong>Right to Delete:</strong> Request deletion of personal information we have collected, subject to certain exceptions.</li>
          <li><strong>Right to Opt-Out:</strong> Right to opt out of the sale of personal information. We do not sell personal information.</li>
          <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA rights.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          To exercise any of these rights, please contact us at <strong>info@topcentral.cn</strong>. We will respond to your request within the timeframe required by applicable law (typically 30 days for GDPR, 45 days for CCPA).
        </p>
      </>
    ),
  },
  {
    title: '7. Cookies & Tracking Technologies',
    content: (
      <>
        <p>
          Our Site uses cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from.
        </p>
        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: 8, fontSize: '0.95rem' }}>Types of Cookies We Use</h4>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for the basic functionality of the Site, such as session management and security.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the Site by collecting anonymous usage data (e.g., Google Analytics, privacy-preserving analytics).</li>
          <li><strong>Functional Cookies:</strong> Remember your preferences (e.g., language, region) to provide a personalized experience.</li>
          <li><strong>Marketing Cookies:</strong> Used to deliver relevant content and measure the effectiveness of our marketing campaigns.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of the Site. For EEA/UK visitors, we request your consent before placing non-essential cookies via a cookie consent banner.
        </p>
      </>
    ),
  },
  {
    title: '8. Data Security',
    content: (
      <>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction, including:
        </p>
        <ul>
          <li>Encryption of data in transit (TLS/SSL) and at rest where feasible.</li>
          <li>Access controls and authentication mechanisms for our internal systems.</li>
          <li>Regular security audits, vulnerability assessments, and penetration testing.</li>
          <li>Data processing agreements with all third-party service providers.</li>
        </ul>
        <p>
          However, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security but will notify you of any data breaches in accordance with applicable laws.
        </p>
      </>
    ),
  },
  {
    title: '9. Third-Party Links',
    content: (
      <>
        <p>
          Our Site may contain links to third-party websites, including partner portals, industry platforms, and social media channels. We are not responsible for the privacy practices or content of those external sites. We encourage you to review their privacy policies before providing any personal data.
        </p>
      </>
    ),
  },
  {
    title: '10. Children&rsquo;s Privacy',
    content: (
      <>
        <p>
          Our Site and services are directed exclusively to businesses and professionals in the B2B plastics recycling and GEO services industry. We do not knowingly collect personal data from individuals under the age of 16. If we become aware that a child has provided us with personal data, we will promptly delete it.
        </p>
      </>
    ),
  },
  {
    title: '11. Changes to This Privacy Policy',
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or operational needs. When we make material changes, we will notify you by posting the updated policy on this page with a revised &ldquo;Last Updated&rdquo; date. We encourage you to review this policy periodically.
        </p>
      </>
    ),
  },
  {
    title: '12. Contact Us',
    content: (
      <>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@topcentral.cn" style={{ color: 'var(--accent-cyan)' }}>info@topcentral.cn</a></li>
          <li><strong>Website:</strong> <a href="https://www.TopcentralGEO.com" style={{ color: 'var(--accent-cyan)' }}>www.TopcentralGEO.com</a></li>
          <li><strong>Company:</strong> Topcentral® GEO</li>
          <li><strong>Data Controller:</strong> For GDPR purposes, Topcentral® GEO acts as the data controller for personal data collected through the Site.</li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Topcentral® GEO — Data Protection & GDPR/CCPA Compliance</title>
        <meta
          name="description"
          content="Topcentral® GEO Privacy Policy — How we collect, use, and protect your personal data. GDPR and CCPA compliant. Servers located in Singapore."
        />
        <meta name="keywords" content="Topcentral Privacy Policy,GDPR,CCPA,Data Protection,Privacy,TopcentralGEO" />
        <link rel="canonical" href="https://www.TopcentralGEO.com/privacy" />
        <meta property="og:title" content="Privacy Policy | Topcentral® GEO" />
        <meta property="og:description" content="GDPR & CCPA compliant. Data protection and privacy practices for Topcentral® GEO." />
      </Head>
      <SEOSchema
        type="WebPage"
        title="Privacy Policy | Topcentral® GEO"
        description="Topcentral® GEO Privacy Policy — GDPR and CCPA compliant data protection practices."
        url="https://www.TopcentralGEO.com/privacy"
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
            <span className="gradient-text">Privacy Policy</span>
          </h1>
          <p
            style={{
              maxWidth: 600,
              margin: '0 auto',
              fontSize: '1rem',
              color: 'var(--text-muted)',
            }}
          >
            Your privacy matters to us. This policy explains how Topcentral® GEO collects, uses, and protects your personal data.
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
          <h2 style={{ marginBottom: 12 }}>Questions About Your Data?</h2>
          <p
            style={{
              maxWidth: 500,
              margin: '0 auto 28px',
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
            }}
          >
            If you have any questions or want to exercise your data rights, please reach out to us.
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
