import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AISmarTOPWidget from './AISmarTOPWidget';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Industry Insights', href: '/articles' },
  { label: 'Applications & Cases', href: '/keywords' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '#contact', isModal: true },
];

export default function Layout({ children }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactSubmitted(true);
        setTimeout(() => {
          setContactModalOpen(false);
          setContactSubmitted(false);
          setContactForm({ name: '', email: '', company: '', message: '' });
        }, 2000);
      }
    } catch (err) {
      console.error('Contact submit error:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ========== Header Navigation ========== */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          background: scrolled
            ? 'rgba(10, 14, 39, 0.92)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
          transition: 'all 0.3s ease',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--max-width)',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 18,
                color: '#fff',
              }}
            >
              G
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  lineHeight: 1.2,
                }}
              >
                Topcentral® GEO
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1 }}>
                AIGC GEO Platform
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="desktop-nav"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = router.pathname === item.href;
              if (item.isModal) {
                return (
                  <button
                    key={item.href}
                    onClick={() => setContactModalOpen(true)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem',
                      fontWeight: 400,
                      color: 'var(--text-secondary)',
                      background: 'transparent',
                      border: '1px solid transparent',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = 'var(--accent-cyan)';
                      e.currentTarget.style.background = 'rgba(100, 255, 218, 0.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {item.label}
                  </button>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(100, 255, 218, 0.08)' : 'transparent',
                    border: isActive ? '1px solid var(--border-cyan)' : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--accent-cyan)';
                      e.currentTarget.style.background = 'rgba(100, 255, 218, 0.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            <a
              href="/articles?filter=aigc"
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem', marginLeft: 12 }}
            >
              AI Indexed
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: 24,
              cursor: 'pointer',
              padding: 8,
            }}
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(10, 14, 39, 0.98)',
            backdropFilter: 'blur(20px)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: 22,
                fontWeight: router.pathname === item.href ? 700 : 400,
                color:
                  router.pathname === item.href
                    ? 'var(--accent-cyan)'
                    : 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '12px 24px',
              }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="/articles?filter=aigc"
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            AI Indexed
          </a>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div style={{ height: 'var(--header-height)' }} />

      {/* ========== Main Content ========== */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* ========== Contact Modal ========== */}
      {contactModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setContactModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              maxWidth: 480,
              width: '100%',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setContactModalOpen(false)}
              style={{
                position: 'absolute',
                top: 16, right: 16,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            <h2 style={{ marginBottom: 8, color: 'var(--accent-cyan)' }}>Contact Us</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
              Leave your information and we will get back to you as soon as possible.
            </p>
            {contactSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--accent-cyan)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <div>Submitted successfully! We will contact you soon.</div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  type="text"
                  placeholder="Your Name *"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
                <textarea
                  placeholder="Your Message or Requirements *"
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', fontSize: '1rem' }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========== Footer ========== */}
      <footer
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          padding: '48px 24px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--max-width)',
            margin: '0 auto',
          }}
        >
          <div className="grid-4" style={{ gap: 32, marginBottom: 40 }}>
            {/* Brand */}
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  marginBottom: 12,
                }}
              >
                Topcentral® GEO
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
                Power Your Presence in the AI Era. We help brands optimize visibility across generative AI platforms with data-driven GEO strategies.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--text-primary)' }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--text-primary)' }}>
                Our Services
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['GEO Strategy', 'AI Content Optimization', 'Citation Building', 'Brand Monitoring', 'Analytics Dashboard'].map(
                  (s) => (
                    <span
                      key={s}
                      style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}
                    >
                      {s}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--text-primary)' }}>
                Contact Us
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div>📧 info@TopcentralGEO.com</div>
                <div>🌐 www.TopcentralGEO.com</div>
                <div style={{ marginTop: 8 }}>
                  <span className="tag tag-cyan">6 AI Engines</span>{' '}
                  <span className="tag tag-cyan">Global Coverage</span>{' '}
                  <span className="tag tag-cyan">Real-time Analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            <div>© {new Date().getFullYear()} Topcentral® GEO. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span>www.TopcentralGEO.com</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========== AI Assistant Widget (floating) ========== */}
      <AISmarTOPWidget />
    </div>
  );
}
