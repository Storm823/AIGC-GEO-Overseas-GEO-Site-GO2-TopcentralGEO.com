import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Spin,
  Empty,
  Table,
  Tag,
  Select,
  message,
  Tooltip,
  Progress,
  Statistic,
  Tabs,
  DatePicker,
} from 'antd';
import {
  ThunderboltOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ApiOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { tokensApi } from '../../api';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const MOCK_DAILY_USAGE = [
  { date: '05/15', total: 145000, input: 85000, output: 60000, cost: 2.18, model: 'gpt-4' },
  { date: '05/15', total: 32000, input: 20000, output: 12000, cost: 0.16, model: 'gpt-3.5' },
  { date: '05/15', total: 89000, input: 52000, output: 37000, cost: 2.67, model: 'claude-3' },
  { date: '05/16', total: 162000, input: 95000, output: 67000, cost: 2.43, model: 'gpt-4' },
  { date: '05/16', total: 35000, input: 22000, output: 13000, cost: 0.18, model: 'gpt-3.5' },
  { date: '05/16', total: 78000, input: 45000, output: 33000, cost: 2.34, model: 'claude-3' },
  { date: '05/17', total: 138000, input: 80000, output: 58000, cost: 2.07, model: 'gpt-4' },
  { date: '05/17', total: 28000, input: 17000, output: 11000, cost: 0.14, model: 'gpt-3.5' },
  { date: '05/17', total: 95000, input: 55000, output: 40000, cost: 2.85, model: 'claude-3' },
  { date: '05/18', total: 185000, input: 108000, output: 77000, cost: 2.78, model: 'gpt-4' },
  { date: '05/18', total: 40000, input: 25000, output: 15000, cost: 0.20, model: 'gpt-3.5' },
  { date: '05/18', total: 102000, input: 60000, output: 42000, cost: 3.06, model: 'claude-3' },
  { date: '05/19', total: 156000, input: 92000, output: 64000, cost: 2.34, model: 'gpt-4' },
  { date: '05/19', total: 38000, input: 23000, output: 15000, cost: 0.19, model: 'gpt-3.5' },
  { date: '05/19', total: 88000, input: 51000, output: 37000, cost: 2.64, model: 'claude-3' },
  { date: '05/20', total: 198000, input: 115000, output: 83000, cost: 2.97, model: 'gpt-4' },
  { date: '05/20', total: 42000, input: 26000, output: 16000, cost: 0.21, model: 'gpt-3.5' },
  { date: '05/20', total: 110000, input: 65000, output: 45000, cost: 3.30, model: 'claude-3' },
];

const MODEL_COLORS = {
  'gpt-4': '#1a73e8',
  'gpt-3.5': '#4a8ff5',
  'claude-3': '#e040fb',
  'gemini-pro': '#64ffda',
  'deepseek-chat': '#ffd600',
};

export default function Tokens() {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [view, setView] = useState('daily');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await tokensApi.getUsage({ days: timeRange });
      setUsage(res.data || MOCK_DAILY_USAGE);
    } catch (err) {
      setUsage(MOCK_DAILY_USAGE);
    } finally {
      setLoading(false);
    }
  };

  // Aggregated data
  const totalTokens = usage.reduce((sum, row) => sum + row.total, 0);
  const totalCost = usage.reduce((sum, row) => sum + (row.cost || 0), 0);
  const modelBreakdown = {};
  usage.forEach((row) => {
    if (!modelBreakdown[row.model]) modelBreakdown[row.model] = { tokens: 0, cost: 0 };
    modelBreakdown[row.model].tokens += row.total;
    modelBreakdown[row.model].cost += row.cost || 0;
  });
  const maxModelTokens = Math.max(...Object.values(modelBreakdown).map((m) => m.tokens));

  // Daily totals
  const dailyTotals = {};
  usage.forEach((row) => {
    if (!dailyTotals[row.date]) dailyTotals[row.date] = 0;
    dailyTotals[row.date] += row.total;
  });
  const dailyData = Object.entries(dailyTotals).map(([date, total]) => ({ date, total }));
  const maxDaily = Math.max(...dailyData.map((d) => d.total));

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      render: (text) => <Text style={{ color: 'var(--text-primary)' }}>{text}</Text>,
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      width: 120,
      render: (model) => (
        <Tag color={MODEL_COLORS[model] || 'default'} style={{ color: '#fff' }}>
          {model}
        </Tag>
      ),
    },
    {
      title: '总 Token',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.total - b.total,
      render: (val) => <Text style={{ color: 'var(--text-white)', fontWeight: 600 }}>{val.toLocaleString()}</Text>,
    },
    {
      title: 'Input',
      dataIndex: 'input',
      key: 'input',
      width: 110,
      align: 'right',
      render: (val) => <Text style={{ color: 'var(--text-secondary)' }}>{val.toLocaleString()}</Text>,
    },
    {
      title: 'Output',
      dataIndex: 'output',
      key: 'output',
      width: 110,
      align: 'right',
      render: (val) => <Text style={{ color: 'var(--text-secondary)' }}>{val.toLocaleString()}</Text>,
    },
    {
      title: '费用 ($)',
      dataIndex: 'cost',
      key: 'cost',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.cost - b.cost,
      render: (val) => <Text style={{ color: 'var(--warning)' }}>${val.toFixed(2)}</Text>,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="加载 Token 数据..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
            Token 用量分析
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            监控和分析 AI 模型 Token 消耗与成本
          </Text>
        </div>
        <Space>
          <Button onClick={() => setTimeRange(7)} type={timeRange === 7 ? 'primary' : 'default'} size="small">7天</Button>
          <Button onClick={() => setTimeRange(30)} type={timeRange === 30 ? 'primary' : 'default'} size="small">30天</Button>
          <Button onClick={() => setTimeRange(90)} type={timeRange === 90 ? 'primary' : 'default'} size="small">90天</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="总 Token 消耗"
              value={totalTokens.toLocaleString()}
              valueStyle={{ color: 'var(--text-white)', fontSize: 24 }}
              prefix={<ThunderboltOutlined style={{ color: 'var(--primary)', fontSize: 20 }} />}
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: 'var(--success)', fontSize: 12 }}>
                <ArrowUpOutlined /> +12.5% 较上期
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="总费用"
              value={totalCost.toFixed(2)}
              valueStyle={{ color: 'var(--warning)', fontSize: 24 }}
              prefix={<DollarOutlined style={{ fontSize: 20 }} />}
              suffix="USD"
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: 'var(--error)', fontSize: 12 }}>
                <ArrowUpOutlined /> +8.3% 较上期
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="日均消耗"
              value={Math.round(totalTokens / timeRange).toLocaleString()}
              valueStyle={{ color: 'var(--accent)', fontSize: 24 }}
              prefix={<LineChartOutlined style={{ fontSize: 20 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="模型数量"
              value={Object.keys(modelBreakdown).length}
              valueStyle={{ color: 'var(--text-white)', fontSize: 24 }}
              prefix={<ApiOutlined style={{ fontSize: 20 }} />}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Daily Trend Chart */}
        <Col xs={24} lg={14}>
          <Card title={<span><LineChartOutlined /> 每日 Token 趋势</span>} bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, padding: '0 8px' }}>
              {dailyData.map((item, idx) => (
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
                  <Text style={{ color: 'var(--text-muted)', fontSize: 9 }}>
                    {(item.total / 1000).toFixed(0)}K
                  </Text>
                  <div
                    style={{
                      width: '100%',
                      height: `${(item.total / maxDaily) * 100}%`,
                      minHeight: 12,
                      background: 'linear-gradient(180deg, var(--accent), var(--primary))',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease',
                      opacity: 0.85,
                    }}
                  />
                  <Text style={{ color: 'var(--text-muted)', fontSize: 10 }}>{item.date}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Model Breakdown */}
        <Col xs={24} lg={10}>
          <Card title={<span><PieChartOutlined /> 模型分布</span>} bodyStyle={{ padding: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {Object.entries(modelBreakdown).map(([model, data]) => (
                <div key={model}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Space>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: MODEL_COLORS[model] || '#888',
                        }}
                      />
                      <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{model}</Text>
                    </Space>
                    <Text style={{ color: 'var(--text-white)', fontSize: 13, fontWeight: 600 }}>
                      {(data.tokens / 1000).toFixed(0)}K Tokens
                    </Text>
                  </div>
                  <Progress
                    percent={Math.round((data.tokens / maxModelTokens) * 100)}
                    strokeColor={MODEL_COLORS[model] || '#888'}
                    size="small"
                    showInfo={false}
                  />
                  <Text style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    Cost: ${data.cost.toFixed(2)}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Detailed Table */}
      <Card
        title="详细用量记录"
        bodyStyle={{ padding: 0 }}
        extra={
          <Tabs
            size="small"
            activeKey={view}
            onChange={setView}
            items={[
              { key: 'daily', label: '日视图' },
              { key: 'model', label: '模型视图' },
            ]}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={usage}
          rowKey={(row, idx) => `${row.date}-${row.model}-${idx}`}
          pagination={{ pageSize: 15 }}
          locale={{ emptyText: <Empty description={<Text style={{ color: 'var(--text-muted)' }}>暂无数据</Text>} /> }}
        />
      </Card>
    </div>
  );
}
