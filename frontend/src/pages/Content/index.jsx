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
  Badge,
  Tabs,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { contentApi } from '../../api';

const { Text, Title } = Typography;
const { TextArea } = Input;

const MOCK_CONTENT = [
  { id: 1, title: 'AIGC 技术发展趋势报告 2026', type: '文章', status: 'published', category: '技术', author: '张明', createdAt: '05/20', updatedAt: '05/21', words: 2560, tokens: 12800 },
  { id: 2, title: '智能 SEO 优化最佳实践指南', type: '指南', status: 'draft', category: 'SEO', author: '李华', createdAt: '05/19', updatedAt: '05/20', words: 1830, tokens: 9200 },
  { id: 3, title: 'AI Agent 架构设计白皮书', type: '白皮书', status: 'review', category: '技术', author: '王芳', createdAt: '05/18', updatedAt: '05/20', words: 4200, tokens: 21000 },
  { id: 4, title: '跨境电商多语言营销策略', type: '文章', status: 'published', category: '市场', author: '陈静', createdAt: '05/17', updatedAt: '05/19', words: 1980, tokens: 9900 },
  { id: 5, title: 'GPT-4 vs Claude-3 性能对比', type: '分析', status: 'draft', category: '技术', author: '张明', createdAt: '05/16', updatedAt: '05/18', words: 3150, tokens: 15700 },
  { id: 6, title: '内容创作自动化工作流配置', type: '教程', status: 'published', category: '教程', author: '李华', createdAt: '05/15', updatedAt: '05/17', words: 1280, tokens: 6400 },
];

const CONTENT_TYPES = ['文章', '指南', '白皮书', '分析', '教程', '报告', '新闻'];
const CATEGORIES = ['技术', 'SEO', '市场', '教程', '产品', '运营'];

export default function Content() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [generateForm] = Form.useForm();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await contentApi.list();
      setContents(res.data || MOCK_CONTENT);
    } catch (err) {
      setContents(MOCK_CONTENT);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      await contentApi.create(values);
      message.success('内容已创建');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchContent();
    } catch (err) {
      if (err.message) message.error('创建失败');
    }
  };

  const handleGenerate = async () => {
    try {
      const values = await generateForm.validateFields();
      await contentApi.generate(values);
      message.success('AI 内容生成任务已提交');
      setGenerateModalVisible(false);
      generateForm.resetFields();
    } catch (err) {
      if (err.message) message.error('生成失败');
    }
  };

  const filteredContent = contents.filter((c) => {
    if (searchText && !c.title.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <Text style={{ color: 'var(--text-white)', fontWeight: 600 }}>{text}</Text>
          <div>
            <Tag style={{ fontSize: 11 }}>{record.type}</Tag>
            <Tag style={{ fontSize: 11 }}>{record.category}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'published' ? 'success' : status === 'review' ? 'processing' : 'default'}>
          {status === 'published' ? '已发布' : status === 'review' ? '审核中' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100,
      render: (text) => <Text style={{ color: 'var(--text-secondary)' }}>{text}</Text>,
    },
    {
      title: '字数',
      dataIndex: 'words',
      key: 'words',
      width: 80,
      align: 'right',
      render: (count) => <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>{count.toLocaleString()}</Text>,
    },
    {
      title: 'Token',
      dataIndex: 'tokens',
      key: 'tokens',
      width: 100,
      align: 'right',
      render: (count) => <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>{count.toLocaleString()}</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (text) => <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>{text}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} style={{ color: 'var(--text-muted)' }} />
          </Tooltip>
          <Tooltip title="复制">
            <Button type="text" icon={<CopyOutlined />} style={{ color: 'var(--text-muted)' }} />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="加载内容列表..." />
      </div>
    );
  }

  const publishedCount = contents.filter((c) => c.status === 'published').length;
  const draftCount = contents.filter((c) => c.status === 'draft').length;
  const totalWords = contents.reduce((sum, c) => sum + c.words, 0);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
            内容管理
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            管理 AI 生成的内容资产
          </Text>
        </div>
        <Space>
          <Button icon={<ExperimentOutlined />} onClick={() => setGenerateModalVisible(true)}>
            AI 生成
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchContent}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            新建内容
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={8} sm={6} lg={4}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="总内容" value={contents.length} valueStyle={{ color: 'var(--text-white)' }} />
          </Card>
        </Col>
        <Col xs={8} sm={6} lg={4}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="已发布" value={publishedCount} valueStyle={{ color: 'var(--success)' }} />
          </Card>
        </Col>
        <Col xs={8} sm={6} lg={4}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="草稿" value={draftCount} valueStyle={{ color: 'var(--warning)' }} />
          </Card>
        </Col>
        <Col xs={8} sm={6} lg={4}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="总字数" value={totalWords.toLocaleString()} valueStyle={{ color: 'var(--text-white)' }} />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card bodyStyle={{ padding: '12px 16px' }} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="搜索标题..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="small"
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%' }}
              size="small"
              options={[
                { value: 'all', label: '所有类型' },
                ...CONTENT_TYPES.map((t) => ({ value: t, label: t })),
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              size="small"
              options={[
                { value: 'all', label: '所有状态' },
                { value: 'published', label: '已发布' },
                { value: 'draft', label: '草稿' },
                { value: 'review', label: '审核中' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Content Table */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredContent}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description={<Text style={{ color: 'var(--text-muted)' }}>暂无内容</Text>} /> }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="新建内容"
        open={createModalVisible}
        onOk={handleCreate}
        onCancel={() => { setCreateModalVisible(false); createForm.resetFields(); }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="输入内容标题" />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select options={CONTENT_TYPES.map((t) => ({ value: t, label: t }))} placeholder="选择类型" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select options={CATEGORIES.map((c) => ({ value: c, label: c }))} placeholder="选择分类" />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <TextArea rows={6} placeholder="输入或粘贴内容" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Generate Modal */}
      <Modal
        title="AI 生成内容"
        open={generateModalVisible}
        onOk={handleGenerate}
        onCancel={() => { setGenerateModalVisible(false); generateForm.resetFields(); }}
        okText="生成"
        cancelText="取消"
        width={600}
      >
        <Form form={generateForm} layout="vertical">
          <Form.Item name="prompt" label="生成提示词" rules={[{ required: true, message: '请输入提示词' }]}>
            <TextArea rows={4} placeholder="描述你想要生成的内容..." />
          </Form.Item>
          <Form.Item name="type" label="内容类型">
            <Select options={CONTENT_TYPES.map((t) => ({ value: t, label: t }))} placeholder="选择类型" />
          </Form.Item>
          <Form.Item name="tone" label="语气风格">
            <Select
              options={[
                { value: 'formal', label: '正式' },
                { value: 'casual', label: '轻松' },
                { value: 'professional', label: '专业' },
                { value: 'creative', label: '创意' },
              ]}
              placeholder="选择语气"
            />
          </Form.Item>
          <Form.Item name="language" label="语言">
            <Select
              options={[
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'English' },
                { value: 'ja', label: '日本語' },
                { value: 'ko', label: '한국어' },
              ]}
              placeholder="选择语言"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
