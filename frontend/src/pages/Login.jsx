import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        localStorage.setItem('aigc_geo_overseas_token', data.access_token);
        localStorage.setItem('aigc_geo_user', JSON.stringify(data.user || {}));
        message.success('登录成功');
        navigate('/dashboard');
      } else {
        message.error(data.message || data.detail || '登录失败，请检查账号密码');
      }
    } catch (err) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0e27 0%, #131a3a 100%)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#131a3a',
          border: '1px solid #1e2a50',
          borderRadius: 16,
          padding: '40px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #1a73e8, #64ffda)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 24,
              color: '#fff',
              margin: '0 auto 16px',
            }}
          >
            T
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e0e6f0', marginBottom: 4 }}>
            TopcentralGEO
          </h1>
          <p style={{ fontSize: 13, color: '#5a6d8a' }}>
            AIGC GEO Agent Management Platform
          </p>
          <p style={{ fontSize: 12, color: '#ff5252', marginTop: 8 }}>
            ⚠️ Internal Platform · Not for Public Access
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#8a9bb5', marginBottom: 6 }}>
              Account / Username
            </label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #1e2a50',
                background: '#0a0e27',
                color: '#e0e6f0',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1a73e8')}
              onBlur={(e) => (e.target.style.borderColor = '#1e2a50')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#8a9bb5', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #1e2a50',
                background: '#0a0e27',
                color: '#e0e6f0',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1a73e8')}
              onBlur={(e) => (e.target.style.borderColor = '#1e2a50')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 8,
              border: 'none',
              background: loading ? '#1e2a50' : 'linear-gradient(135deg, #1a73e8, #64ffda)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginTop: 8,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid #1e2a50',
            textAlign: 'center',
            fontSize: 12,
            color: '#5a6d8a',
          }}
        >
          <div>Topcentral® · Internal Use Only</div>
          <div style={{ marginTop: 4 }}>Unauthorized access will be recorded</div>
        </div>
      </div>
    </div>
  );
}

export default Login;
