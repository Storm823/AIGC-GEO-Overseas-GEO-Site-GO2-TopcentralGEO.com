import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Input, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  RobotOutlined,
  TeamOutlined,
  ApartmentOutlined,
  ProjectOutlined,
  FileTextOutlined,
  TagsOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  MessageOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  SearchOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/agents', icon: <RobotOutlined />, label: 'Agent Management' },
  { key: '/team', icon: <TeamOutlined />, label: 'Team' },
  { key: '/workflow', icon: <ApartmentOutlined />, label: 'Workflows' },
  { key: '/tasks', icon: <ProjectOutlined />, label: 'Task Board' },
  { key: '/content', icon: <FileTextOutlined />, label: 'Content' },
  { key: '/keywords', icon: <TagsOutlined />, label: 'Keywords' },
  { key: '/tokens', icon: <ThunderboltOutlined />, label: 'Token Usage' },
  { key: '/plugins', icon: <AppstoreOutlined />, label: 'Plugins' },
  { key: '/chat', icon: <MessageOutlined />, label: 'AI Chat' },
];

const userMenuItems = [
  { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
  { type: 'divider' },
  { key: 'logout', icon: <LogoutOutlined />, label: 'Log Out', danger: true },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications] = useState(3);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('aigc_geo_overseas_token');
      window.location.href = '/login';
    }
  };

  const selectedKey = '/' + location.pathname.split('/')[1];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        collapsedWidth={64}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          borderRight: '1px solid var(--border-color)',
          background: 'var(--bg-sidebar)',
        }}
      >
        {/* Logo Area */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: '1px solid var(--border-color)',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/dashboard')}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            G
          </div>
          {!collapsed && (
            <div style={{ marginLeft: 12, overflow: 'hidden' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-white)', lineHeight: 1.2 }}>
                AIGC GEO
              </div>
              <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: 2 }}>
                OVERSEAS PLATFORM
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            borderRight: 'none',
            marginTop: 8,
          }}
        />

        {/* Bottom Collapse Button */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid var(--border-color)',
            padding: '12px 0',
            textAlign: 'center',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: 'var(--text-muted)' }}
          />
        </div>
      </Sider>

      {/* Main Content Area */}
      <Layout style={{ marginLeft: collapsed ? 64 : 240, transition: 'all 0.2s' }}>
        {/* Top Header */}
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            background: 'var(--bg-header)',
            borderBottom: '1px solid var(--border-color)',
            height: 56,
          }}
        >
          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: 480 }}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="Search agents, tasks, content..."
              bordered={false}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                background: searchFocused ? 'var(--bg-input)' : 'transparent',
                color: 'var(--text-primary)',
                borderRadius: 6,
                transition: 'all 0.3s',
                border: searchFocused ? '1px solid var(--primary)' : '1px solid transparent',
              }}
            />
          </div>

          {/* Right Actions */}
          <Space size={16}>
            {/* Fullscreen */}
            <Button
              type="text"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
              style={{ color: 'var(--text-muted)', fontSize: 16 }}
            />

            {/* Notifications */}
            <Badge count={notifications} size="small" offset={[-2, 2]}>
              <BellOutlined style={{ color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }} />
            </Badge>

            {/* User Avatar */}
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer', padding: '2px 8px', borderRadius: 6, transition: 'all 0.2s' }}>
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    cursor: 'pointer',
                  }}
                />
                {!collapsed && (
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>Admin</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>admin@topcentralgeo.com</div>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Page Content */}
        <Content
          style={{
            minHeight: 'calc(100vh - 56px)',
            background: 'var(--bg-main)',
            position: 'relative',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
