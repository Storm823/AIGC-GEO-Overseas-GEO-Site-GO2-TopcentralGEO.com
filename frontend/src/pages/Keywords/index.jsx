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
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Progress,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  StarOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { keywordsApi } from '../../api';

const { Text, Title } = Typography;

const MOCK_KEYWORDS = [
  { id: 1, keyword: 'AIGC 内容生成', group: '核心', searchVolume: 12500, difficulty: 68, currentRank: 12, targetRank: 5, trend: 'up', status: 'optimizing', createdAt: '05/10' },
  { id: 2, keyword: 'AI SEO 优化', group: '核心', searchVolume: 8900, difficulty: 72, currentRank: 18, targetRank: 8, trend: 'up', status: 'optimizing', createdAt: '05/10' },
  { id: 3, keyword: '智能客服机器人', group: '产品', searchVolume: 15200, difficulty: 45, currentRank: 6, targetRank: 3, trend: 'stable', status: 'tracked', createdAt: '05/12' },
  { id: 4, keyword: '自动化内容创作', group: '核心', searchVolume: 6700, difficulty: 55, currentRank: 22, targetRank: 10, trend: 'up', status: 'optimizing', createdAt: '05/10' },
  { id: 5, keyword: 'AI 数据分析工具', group: '产品', searchVolume: 9800, difficulty: 60, currentRank: 15, targetRank: 7, trend: 'down', status: 'optimizing', createdAt: '05/14' },
  { id: 6, keyword: '多语言翻译 API', group: '功能', searchVolume: 4300, difficulty: 38, currentRank: 9, targetRank: 4, trend: 'stable', status: 'tracked', createdAt: '05/15' },
  { id: 7, keyword: 'AIGC Platform China', group: '品牌', searchVolume: 2100, difficulty: 25, currentRank: 3, targetRank: 1, trend: 'up', status: 'tracked', createdAt: '05/10' },
  { id: 8, keyword: 'AI Agent 开发平台', group: '核心', searchVolume: 7600, difficulty: 65, currentRank: 20, targetRank: 8, trend: 'up', status: 'optimizing', createdAt: '05/11' },
  { id: 9, keyword: '工作流自动化 AI', group: '功能', searchVolume: 5400, difficulty: 48, currentRank: 14, targetRank: 6, trend: 'stable', status: 'tracked', createdAt: '05/13' },
  { id: 10, keyword: 'Token 用量管理', group: '功能', searchVolume: 3200, difficulty: 30, currentRank: 8, targetRank: 4, trend: 'down', status: 'tracked', createdAt: '05/16' },
];

const GROUP_COLORS = {
  '核心': '#1a73e8',
  '产品': '#64ffda',
  '功能': '#ffd600',
  '品牌': '#e040fb',
};

const DIFFICULTY_COLOR = (d) => {
  if (d >= 70) return 'var(--error)';
  if (d >= 50) return 'var(--warning)';
  return 'var(--success)';
};

export default function Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [analyzeModalVisible, setAnalyzeModalVisible] = useState(false);
  const [analyzeForm] = Form.useForm();

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const res = await keywordsApi.list();
      setKeywords(res.data || MOCK_KEYWORDS);
    } catch (err) {
      setKeywords(MOCK_KEYWORDS);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      await keywordsApi.batchCreate({ keywords: values.keywords.split('\n').filter(Boolean), group: values.group });
      message.success('关键词已添加');
      setAddModalVisible(false);
      addForm.resetFields();
      fetchKeywords();
    } catch (err) {
      if (err.message) message.error('添加失败');
    }
  };

  const handleAnalyze = async () => {
    try {
      const values = await analyzeForm.validateFields();
      await keywordsApi.analyze(values);
      message.success('关键词分析任务已提交');
      setAnalyzeModalVisible(false);
      analyzeForm.resetFields();
    } catch (err) {
      if (err.message) message.error('分析失败');
    }
  };

  const filteredKeywords = keywords.filter((k) => {
    if (searchText && !k.keyword.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (groupFilter !== 'all' && k.group !== groupFilter) return false;
    return true;
  });

  const columns = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color={GROUP_COLORS[record.group] || 'default'} style={{ fontSize: 11 }}>
            {record.group}
          </Tag>
          <Text style={{ color: 'var(--text-white)', fontWeight: 600 }}>{text}</Text>
          {record.trend === 'up' && <RiseOutlined style={{ color: 'var(--success)', fontSize: 12 }} />}
          {record.trend === 'down' && <FallOutlined style={{ color: 'var(--error)', fontSize: 12 }} />}
          {record.trend === 'stable' && <MinusOutlined style={{ color: 'var(--text-muted)', fontSize: 12 }} />}
        </div>
      ),
    },
    {
      title: '搜索量',
      dataIndex: 'searchVolume',
      key: 'searchVolume',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.searchVolume - b.searchVolume,
      render: (vol) => <Text style={{ color: 'var(--text-white)' }}>{vol.toLocaleString()}</Text>,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 120,
      sorter: (a, b) => a.difficulty - b.difficulty,
      render: (diff) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={diff}
            size="small"
            strokeColor={DIFFICULTY_COLOR(diff)}
            format={() => ''}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <Text style={{ color: DIFFICULTY_COLOR(diff), fontSize: 12, fontWeight: 600, width: 30 }}>
            {diff}
          </Text>
        </div>
      ),
    },
    {
      title: '当前排名',
      dataIndex: 'currentRank',
      key: 'currentRank',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.currentRank - b.currentRank,
      render: (rank) => (
        <Text style={{ color: rank <= 10 ? 'var(--success)' : rank <= 20 ? 'var(--warning)' : 'var(--text-muted)', fontWeight: 600 }}>
          #{rank}
        </Text>
      ),
    },
    {
      title: '目标排名',
      dataIndex: 'targetRank',
      key: 'targetRank',
      width: 100,
      align: 'center',
      render: (rank) => (
        <Text style={{ color: 'var(--accent)', fontWeight: 600 }}>#{rank}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'optimizing' ? 'processing' : 'default'}>
          {status === 'optimizing' ? '优化中' : '已收录'}
        </Tag>
      ),
    },
    {
      title: '添加时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (text) => <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>{text}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Tooltip title="删除">
          <Button type="text" icon={<DeleteOutlined />} danger onClick={() => {
            keywordsApi.delete(record.id).then(() => {
              message.success('已删除');
              fetchKeywords();
            }).catch(() => message.error('删除失败'));
          }} />
        </Tooltip>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="加载关键词数据..." />
      </div>
    );
  }

  const groups = [...new Set(keywords.map((k) => k.group))];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
            关键词管理
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            跟踪和分析关键词排名与搜索表现
          </Text>
        </div>
        <Space>
          <Button icon={<BarChartOutlined />} onClick={() => setAnalyzeModalVisible(true)}>
            批量分析
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchKeywords}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
            添加关键词
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="总关键词" value={keywords.length} valueStyle={{ color: 'var(--text-white)' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="优化中" value={keywords.filter((k) => k.status === 'optimizing').length} valueStyle={{ color: 'var(--warning)' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="排名前10" value={keywords.filter((k) => k.currentRank <= 10).length} valueStyle={{ color: 'var(--success)' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="分组数" value={groups.length} suffix="组" valueStyle={{ color: 'var(--text-white)' }} />
          </Card>
        </Col>
      </Row>

      {/* Groups Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {groups.map((group) => (
          <Col key={group}>
            <Tag
              color={GROUP_COLORS[group] || 'default'}
              style={{ padding: '4px 16px', fontSize: 13, cursor: 'pointer' }}
              onClick={() => setGroupFilter(group === groupFilter ? 'all' : group)}
            >
              {group} ({keywords.filter((k) => k.group === group).length})
            </Tag>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card bodyStyle={{ padding: '12px 16px' }} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="搜索关键词..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="small"
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={groupFilter}
              onChange={setGroupFilter}
              style={{ width: '100%' }}
              size="small"
              options={[
                { value: 'all', label: '全部分组' },
                ...groups.map((g) => ({ value: g, label: g })),
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredKeywords}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description={<Text style={{ color: 'var(--text-muted)' }}>暂无关键词</Text>} /> }}
        />
      </Card>

      {/* Add Modal */}
      <Modal
        title="添加关键词"
        open={addModalVisible}
        onOk={handleAdd}
        onCancel={() => { setAddModalVisible(false); addForm.resetFields(); }}
        okText="添加"
        cancelText="取消"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="keywords" label="关键词（每行一个）" rules={[{ required: true, message: '请输入至少一个关键词' }]}>
            <Input.TextArea rows={6} placeholder="输入关键词，每行一个&#10;例如：&#10;AIGC 内容生成&#10;AI SEO 优化&#10;智能客服机器人" />
          </Form.Item>
          <Form.Item name="group" label="分组">
            <Select
              options={[
                { value: '核心', label: '核心' },
                { value: '产品', label: '产品' },
                { value: '功能', label: '功能' },
                { value: '品牌', label: '品牌' },
              ]}
              placeholder="选择分组"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Analyze Modal */}
      <Modal
        title="批量关键词分析"
        open={analyzeModalVisible}
        onOk={handleAnalyze}
        onCancel={() => { setAnalyzeModalVisible(false); analyzeForm.resetFields(); }}
        okText="开始分析"
        cancelText="取消"
      >
        <Form form={analyzeForm} layout="vertical">
          <Form.Item name="keywords" label="要分析的关键词" rules={[{ required: true, message: '请输入关键词' }]}>
            <Input.TextArea rows={4} placeholder="输入要分析的关键词，每行一个" />
          </Form.Item>
          <Form.Item name="engine" label="搜索引擎">
            <Select
              options={[
                { value: 'baidu', label: '百度' },
                { value: 'google', label: 'Google' },
                { value: 'all', label: '全部' },
              ]}
              placeholder="选择搜索引擎"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
