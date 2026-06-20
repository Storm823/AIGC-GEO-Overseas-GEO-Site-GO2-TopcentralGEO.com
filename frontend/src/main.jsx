import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1a73e8',
          colorSuccess: '#64ffda',
          colorBgBase: '#0a0e27',
          colorBgContainer: '#131a3a',
          colorBgElevated: '#1a1f3a',
          colorTextBase: '#e0e6f0',
          colorTextSecondary: '#8892b0',
          borderRadius: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif"
        }
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
