import Head from 'next/head';
import { useState, useMemo } from 'react';
import SEOSchema from '../../components/SEOSchema';
import KeywordCloud from '../../components/KeywordCloud';
import { AIGC_KEYWORDS, AI_KEYWORDS } from '../../data/keywords';

export default function KeywordsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('cloud');

  const allKeywords = useMemo(() => {
    if (activeTab === 'all') return [...AIGC_KEYWORDS, ...AI_KEYWORDS];
    if (activeTab === 'aigc') return AIGC_KEYWORDS;
    return AI_KEYWORDS;
  }, [activeTab]);

  return (
    <>
      <Head>
        <title>Keywords | Topcentral® GEO — AIGC Keywords & AI Terms</title>
        <meta
          name="description"
          content={`Topcentral® GEO Keywords: ${AIGC_KEYWORDS.length} keywords indexed by AIGC platforms, ${AI_KEYWORDS.length} AI-adopted terms.`}
        />
        <meta name="keywords" content="Topcentral,Keywords,AIGC Indexed,AI Adopted,Keyword Cloud" />
        <link rel="canonical" href="https://www.TopcentralGEO.com/keywords" />
        <meta property="og:title" content="Keywords | Topcentral® GEO — AIGC Index & AI Adoption" />
        <meta property="og:description" content={`${AIGC_KEYWORDS.length} AIGC-indexed keywords · ${AI_KEYWORDS.length} AI-adopted terms`} />
      </Head>
      <SEOSchema
        type="CollectionPage"
        title="Keywords | Topcentral® GEO"
        description="Topcentral® GEO AIGC Keywords and AI-Adopted Terms"
        url="https://www.TopcentralGEO.com/keywords"
      />

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          padding: '48px 24px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container">
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              marginBottom: 12,
            }}
          >
            <span className="gradient-text">Keywords</span>
          </h1>
          <p style={{ maxWidth: 600, margin: '0 auto', color: 'var(--text-muted)' }}>
            {AIGC_KEYWORDS.length} keywords indexed by AIGC platforms · {AI_KEYWORDS.length} AI-adopted professional terms
          </p>
        </div>
      </section>

      {/* Stats */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '24px 0',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {AIGC_KEYWORDS.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                AIGC-Indexed Keywords
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                ChatGPT / Claude / Gemini / Perplexity / DeepSeek
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-blue-light)' }}>
                {AI_KEYWORDS.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                AI-Adopted Terms
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Incorporated into AI training data
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'aigc', label: 'AIGC Indexed' },
              { key: 'ai', label: 'AI Adopted' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '6px 18px',
                  borderRadius: 20,
                  border: `1px solid ${activeTab === tab.key ? 'var(--border-cyan)' : 'var(--border-color)'}`,
                  background: activeTab === tab.key ? 'rgba(100,255,218,0.08)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setViewMode('cloud')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${viewMode === 'cloud' ? 'var(--border-cyan)' : 'var(--border-color)'}`,
                background: viewMode === 'cloud' ? 'rgba(100,255,218,0.08)' : 'transparent',
                color: viewMode === 'cloud' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              ☁️ Cloud
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${viewMode === 'list' ? 'var(--border-cyan)' : 'var(--border-color)'}`,
                background: viewMode === 'list' ? 'rgba(100,255,218,0.08)' : 'transparent',
                color: viewMode === 'list' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              📋 List
            </button>
          </div>
        </div>
      </div>

      {/* Keywords Display */}
      <div className="container" style={{ padding: '32px 24px 60px' }}>
        {viewMode === 'cloud' ? (
          <div
            className="card"
            style={{
              cursor: 'default',
              minHeight: 300,
            }}
          >
            <KeywordCloud keywords={allKeywords} mode="cloud" />
          </div>
        ) : (
          <KeywordCloud keywords={allKeywords} mode="list" />
        )}

        {/* Note */}
        <div
          style={{
            marginTop: 32,
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          <strong style={{ color: 'var(--accent-cyan)' }}>About Keyword Indexing</strong>
          <p style={{ margin: '8px 0 0', fontSize: '0.8rem' }}>
            AIGC-indexed keywords refer to brand and product information from Topcentral® that has been incorporated into the knowledge bases of major AI platforms (ChatGPT, Claude, Gemini, Perplexity, DeepSeek). Users can query relevant product information through these platforms' dialog interfaces.
            AI-adopted terms are professional terminology that has been effectively incorporated as valid training data by AI models during training, enhancing the models' semantic understanding in the circular economy materials domain.
          </p>
        </div>
      </div>
    </>
  );
}
