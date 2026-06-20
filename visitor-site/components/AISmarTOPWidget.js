import { useState, useRef, useEffect } from 'react';

/**
 * AI Assistant Widget — Floating chat button
 * Displays on all pages, expandable/minimizable, simulates AI assistant communication
 */
export default function AISmarTOPWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Assistant for Topcentral® GEO. I can help you learn about GEO strategies, AI content optimization, citation building, and brand monitoring across generative AI platforms. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Quick reply presets
  const quickReplies = [
    'What is GEO?',
    'Which AI engines do you support?',
    'How does citation building work?',
    'What services do you offer?',
  ];

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMessage = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulated AI response — can be connected to real LLM API in production
    setTimeout(() => {
      const reply = generateReply(msg);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI assistant"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
          color: '#fff',
          fontSize: 24,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(26, 115, 232, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            zIndex: 9999,
            width: 380,
            maxWidth: 'calc(100vw - 48px)',
            height: 520,
            maxHeight: 'calc(100vh - 140px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-cyan)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-secondary))',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              G
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>
                GEO Assistant
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Online · AI-powered Q&A
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 16px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius:
                      msg.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-blue-light))'
                        : 'var(--bg-elevated)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Thinking
                  <span style={{ animation: 'pulse 1.5s infinite' }}>...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div
            style={{
              padding: '8px 16px',
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {quickReplies.map((text) => (
              <button
                key={text}
                onClick={() => handleSend(text)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-cyan)';
                  e.currentTarget.style.color = 'var(--accent-cyan)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {text}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: 8,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: input.trim()
                  ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-blue-light))'
                  : 'var(--bg-elevated)',
                color: input.trim() ? '#fff' : 'var(--text-muted)',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Simple AI reply generator
 * Can be connected to real LLM API in production
 */
function generateReply(text) {
  const lower = text.toLowerCase();

  if (lower.includes('geo') || lower.includes('generative engine optimization')) {
    return '**Generative Engine Optimization (GEO)** is the practice of optimizing your brand\'s visibility and presence across AI-powered search and generative platforms.\n\nUnlike traditional SEO which targets search engines, GEO focuses on:\n\n1️⃣ **AI Citations** — Getting your brand mentioned in AI responses\n2️⃣ **Content Optimization** — Structuring content for AI comprehension\n3️⃣ **Brand Monitoring** — Tracking where and how AI platforms reference you\n4️⃣ **Citation Building** — Establishing authoritative mentions across the web\n\nTopcentral® GEO helps brands stay visible as users shift from traditional search to AI assistants.';
  }

  if (lower.includes('engine') || lower.includes('platform') || lower.includes('support')) {
    return 'Topcentral® GEO monitors and optimizes your brand across 6 major AI engines:\n\n🤖 **ChatGPT** — OpenAI\n🤖 **Claude** — Anthropic\n🤖 **Gemini** — Google\n🤖 **Perplexity** — Real-time AI search\n🤖 **Copilot** — Microsoft\n🤖 **DeepSeek** — Advanced reasoning\n\nWe track citations, sentiment, and visibility metrics across all platforms with real-time analytics.';
  }

  if (lower.includes('citation') || lower.includes('building') || lower.includes('mention')) {
    return '**Citation Building** is the core of GEO strategy. It involves:\n\n✅ **Authority Signals** — Getting mentioned on high-trust domains\n✅ **Structured Data** — Implementing Schema.org markup for AI parsing\n✅ **Content Freshness** — Keeping information current and accurate\n✅ **Multi-source Presence** — Building presence across diverse platforms\n\nTopcentral® GEO\'s citation scoring algorithm evaluates 50+ factors to maximize your brand\'s likelihood of being cited by AI systems.';
  }

  if (lower.includes('service') || lower.includes('offer') || lower.includes('what do you')) {
    return 'Topcentral® GEO offers comprehensive GEO services:\n\n📊 **GEO Strategy** — Custom roadmaps for AI visibility\n✍️ **AI Content Optimization** — Content structured for AI comprehension\n🔗 **Citation Building** — Authority signal development\n📈 **Brand Monitoring** — Real-time tracking across AI platforms\n📋 **Analytics Dashboard** — Comprehensive performance metrics\n\nOur platform processes 1M+ data points daily to keep your brand ahead in the AI era.';
  }

  if (lower.includes('contact') || lower.includes('email') || lower.includes('reach')) {
    return 'You can reach us through:\n\n🌐 Website: www.TopcentralGEO.com\n📧 Email: info@TopcentralGEO.com\n\nOur team typically responds within 24 hours. We\'d love to discuss how GEO can transform your brand\'s AI visibility.';
  }

  return `Thanks for your question about "${text}".\n\nTopcentral® GEO is dedicated to helping brands thrive in the AI era through strategic Generative Engine Optimization. Our platform monitors 6 major AI engines, processes 1M+ data points daily, and provides actionable insights to maximize your brand's AI visibility.\n\nFeel free to ask about our services, GEO strategies, or how we can help your specific use case.`;
}
