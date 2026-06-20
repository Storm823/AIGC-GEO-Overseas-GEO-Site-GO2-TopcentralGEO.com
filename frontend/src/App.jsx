import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import AgentDetail from './pages/Agents/AgentDetail';
import CreateAgent from './pages/Agents/CreateAgent';
import Team from './pages/Team';
import Workflow from './pages/Workflow';
import Tasks from './pages/Tasks';
import Content from './pages/Content';
import Keywords from './pages/Keywords';
import Tokens from './pages/Tokens';
import Plugins from './pages/Plugins';
import Chat from './pages/Chat';
import Login from './pages/Login';
import AISmarTOP from './components/smartop/AISmarTOP';
import './styles/global.css';

const customTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1a73e8',
    colorSuccess: '#00c853',
    colorWarning: '#ffd600',
    colorError: '#ff5252',
    colorInfo: '#40c4ff',
    colorBgBase: '#0a0e27',
    colorBgContainer: '#131a3a',
    colorBgElevated: '#1a2348',
    colorBorder: '#1e2a50',
    colorText: '#e0e6f0',
    colorTextSecondary: '#8a9bb5',
    colorTextTertiary: '#5a6d8a',
    borderRadius: 8,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
};

// Route guard - check auth
function RequireAuth({ children }) {
  const token = localStorage.getItem('aigc_geo_overseas_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <ConfigProvider theme={customTheme}>
      <HashRouter>
        <Routes>
          {/* Public route - Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="agents" element={<Agents />} />
            <Route path="agents/create" element={<CreateAgent />} />
            <Route path="agents/create/:duplicateId" element={<CreateAgent />} />
            <Route path="agents/:id" element={<AgentDetail />} />
            <Route path="team" element={<Team />} />
            <Route path="workflow" element={<Workflow />} />
            <Route path="workflow/:id" element={<Workflow />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="content" element={<Content />} />
            <Route path="keywords" element={<Keywords />} />
            <Route path="tokens" element={<Tokens />} />
            <Route path="plugins" element={<Plugins />} />
            <Route path="chat" element={<Chat />} />
          </Route>

          {/* Redirect unknown to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        {/* Floating AI SmarTOP Assistant - only visible when logged in */}
        <AuthAwareSmarTOP />
      </HashRouter>
    </ConfigProvider>
  );
}

// Only show SmarTOP when authenticated
function AuthAwareSmarTOP() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const check = () => setHasToken(!!localStorage.getItem('aigc_geo_overseas_token'));
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  return hasToken ? <AISmarTOP /> : null;
}

export default App;
