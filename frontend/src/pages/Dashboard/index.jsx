import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Empty,
  Button,
  Progress,
  Tag,
  Table,
  Space,
  Alert,
} from 'antd';
import {
  RobotOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  TeamOutlined,
  ApiOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { dashboardApi } from '../../api';

const { Title, Text } = Typography;

const KPI_CARDS = [
  { key: 'totalAgents', icon: <RobotOutlined />, label: 'Total Agents', color: '#1a73e8' },
  { key: 'activeAgents', icon: <CheckCircleOutlined />, label: 'Active Agents', color: '#00c853' },
  { key: 'totalTokens', icon: <ThunderboltOutlined />, label: 'Today Token Usage', color: '#64ffda', suffix: 'K' },
  { key: 'errorRate', icon: <WarningOutlined />, label: 'Error Rate', color: '#ff5252', suffix: '%' },
];

const MOCK_DASHBOARD = {
  stats: {
    totalAgents: 24,
    activeAgents: 16,
    totalTokens: 128,
    errorRate: 2.4,
    totalTasks: 1458,
    activeTasks: 89,
    teamMembers: 12,
    uptime: 99.7,
  },
  agents: [
    { id: 1, name: 'Content Generator Agent', status: 'online', model: 'gpt-4', tasksToday: 45, successRate: 98 },
    { id: 2, name: 'SEO Optimizer Agent', status: 'online', model: 'gpt-4', tasksToday: 32, successRate: 92 },
    { id: 3, name: 'Data Analysis Agent', status: 'busy', model: 'claude-3', tasksToday: 67, successRate: 88 },
    { id: 4, name: 'Customer Service Agent', status: 'online', model: 'gpt-3.5', tasksToday: 128, successRate: 95 },
    { id: 5, name: 'Knowledge Base Agent', status: 'offline', model: 'gpt-4', tasksToday: 0, successRate: 0 },
    { id: 6, name: 'Translation Agent', status: 'online', model: 'gpt-4', tasksToday: 56, successRate: 96 },
  ],
  tokenTrend: [
    { date: '05/15', tokens: 85 }, { date: '05/16', tokens: 92 }, { date: '05/17', tokens: 78 },
    { date: '05/18', tokens: 110 }, { date: '05/19', tokens: 95 }, { date: '05/20', tokens: 128 },
    { date: '05/21', tokens: 102 },
  ],
  recentActivity: [
    { time: '09:32', action: 'Agent "Content Generator" task completed', type: 'success' },
    { time: '09:28', action: 'Workflow "SEO Batch Processing" executed successfully', type: 'success' },
    { time: '09:15', action: 'Token usage reached 80% of daily limit', type: 'warning' },
    { time: '09:02', action: 'New Agent "Customer Assistant" created', type: 'info' },
    { time: '08:45', action: 'Data export task completed', type: 'success' },
    { time: '08:30', action: 'System auto-backup completed', type: 'info' },
  ],
};

const statusConfig = {
  online: { color: 'var(--success)', label: 'Online', tagColor: 'success' },
  offline: { color: 'var(--text-muted)', label: 'Offline', tagColor: 'default' },
  error: { color: 'var(--error)', label: 'Error', tagColor: 'error' },
  busy: { color: 'var(--warning)', label: 'Busy', tagColor: 'warning' },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(MOCK_DASHBOARD);
  const [timeRange, setTimeRange] = useState(7);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, agentRes, trendRes, activityRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getAgentStatus(),
        dashboardApi.getTokenTrend(timeRange),
        dashboardApi.getRecentActivity(),
      ]);
      setData({
        stats: statsRes.data || MOCK_DASHBOARD.stats,
        agents: agentRes.data || MOCK_DASHBOARD.agents,
        tokenTrend: trendRes.data || MOCK_DASHBOARD.tokenTrend,
        recentActivity: activityRes.data || MOCK_DASHBOARD.recentActivity,
      });
    } catch (err) {
      // Use mock data on error
      setData(MOCK_DASHBOARD);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const maxToken = Math.max(...(data.tokenTrend || []).map((t) => t.tokens));
  const activeCount = data.agents.filter((a) => a.status === 'online' || a.status === 'busy').length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
            Dashboard
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            AIGC GEO Platform real-time operational status & data overview
          </Text>
        </div>
        <Space>
          <Button onClick={() => setTimeRange(7)} type={timeRange === 7 ? 'primary' : 'default'} size="small">7D</Button>
          <Button onClick={() => setTimeRange(30)} type={timeRange === 30 ? 'primary' : 'default'} size="small">30D</Button>
          <Button onClick={() => setTimeRange(90)} type={timeRange === 90 ? 'primary' : 'default'} size="small">90D</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {KPI_CARDS.map((kpi) => (
          <Col xs={24} sm={12} lg={6} key={kpi.key}>
            <Card className="kpi-card fade-in" bodyStyle={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-value">
                    {data.stats?.[kpi.key] ?? 0}
                    {kpi.suffix && <span style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 4 }}>{kpi.suffix}</span>}
                  </div>
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${kpi.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    color: kpi.color,
                  }}
                >
                  {kpi.icon}
                </div>
              </div>
              <div className="kpi-trend up" style={{ marginTop: 12 }}>
                <ArrowUpOutlined />
                <span>vs yesterday +12.5%</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Second Row: Agent Status + Token Trend */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Agent Status */}
        <Col xs={24} lg={12}>
          <Card title={<span style={{ fontSize: 14 }}>🤖 Agent Status</span>} bodyStyle={{ padding: 16 }}>
            <div style={{ marginBottom: 16, display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={Math.round((activeCount / Math.max(data.agents.length, 1)) * 100)}
                  width={80}
                  strokeColor={{
                    '0%': '#1a73e8',
                    '100%': '#64ffda',
                  }}
                  format={() => `${activeCount}/${data.agents.length}`}
                />
                <Text style={{ display: 'block', color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                  Online Rate
                </Text>
              </div>
              <div style={{ flex: 1 }}>
                {data.agents.slice(0, 4).map((agent) => {
                  const st = statusConfig[agent.status] || statusConfig.offline;
                  return (
                    <div
                      key={agent.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`status-dot ${agent.status}`} />
                        <Text style={{ color: 'var(--text-primary)', fontSize: 13 }}>{agent.name}</Text>
                      </div>
                      <Tag color={st.tagColor} style={{ fontSize: 11, lineHeight: '20px' }}>
                        {st.label}
                      </Tag>
                    </div>
                  );
                })}
                {data.agents.length > 4 && (
                  <Text style={{ color: 'var(--text-muted)', fontSize: 12, display: 'block', textAlign: 'center', marginTop: 8 }}>
                    +{data.agents.length - 4} more Agents
                  </Text>
                )}
              </div>
            </div>
          </Card>
        </Col>

        {/* Token Trend */}
        <Col xs={24} lg={12}>
          <Card title={<span style={{ fontSize: 14 }}>⚡ Token Usage Trend</span>} bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, padding: '0 8px' }}>
              {data.tokenTrend.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Text style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                    {item.tokens}
                  </Text>
                  <div
                    style={{
                      width: '100%',
                      height: `${(item.tokens / maxToken) * 100}%`,
                      minHeight: 8,
                      background: `linear-gradient(180deg, var(--accent), var(--primary))`,
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease',
                      opacity: 0.8,
                    }}
                  />
                  <Text style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 4 }}>
                    {item.date}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Third Row: Activity + Secondary Metrics */}
      <Row gutter={[16, 16]}>
        {/* Recent Activity */}
        <Col xs={24} lg={14}>
          <Card title={<span style={{ fontSize: 14 }}>🕐 Recent Activity</span>} bodyStyle={{ padding: 0 }}>
            <div style={{ padding: 8 }}>
              {data.recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    borderBottom: idx < data.recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26,115,232,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: activity.type === 'success' ? 'var(--success)' :
                                   activity.type === 'warning' ? 'var(--warning)' : 'var(--info)',
                      flexShrink: 0,
                    }}
                  />
                  <Text style={{ color: 'var(--text-muted)', fontSize: 12, width: 48, flexShrink: 0 }}>
                    {activity.time}
                  </Text>
                  <Text style={{ color: 'var(--text-primary)', fontSize: 13, flex: 1 }}>
                    {activity.action}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Secondary Metrics */}
        <Col xs={24} lg={10}>
          <Card title={<span style={{ fontSize: 14 }}>📊 System Metrics</span>} bodyStyle={{ padding: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>System Uptime</Text>
                  <Text style={{ color: 'var(--text-white)', fontSize: 12, fontWeight: 600 }}>{data.stats.uptime}%</Text>
                </div>
                <Progress percent={data.stats.uptime} strokeColor="#64ffda" size="small" showInfo={false} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Total Tasks</Text>
                  <Text style={{ color: 'var(--text-white)', fontSize: 12, fontWeight: 600 }}>{data.stats.totalTasks}</Text>
                </div>
                <Progress percent={Math.min((data.stats.totalTasks / 2000) * 100, 100)} strokeColor="#1a73e8" size="small" showInfo={false} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Active Tasks</Text>
                  <Text style={{ color: 'var(--text-white)', fontSize: 12, fontWeight: 600 }}>{data.stats.activeTasks}</Text>
                </div>
                <Progress percent={Math.round((data.stats.activeTasks / data.stats.totalTasks) * 100)} strokeColor="#ffd600" size="small" showInfo={false} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Team Members</Text>
                  <Text style={{ color: 'var(--text-white)', fontSize: 12, fontWeight: 600 }}>{data.stats.teamMembers}</Text>
                </div>
                <Progress percent={Math.round((data.stats.teamMembers / 20) * 100)} strokeColor="#40c4ff" size="small" showInfo={false} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
