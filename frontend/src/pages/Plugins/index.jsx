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
  Switch,
  Badge,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  AppstoreOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { pluginsApi } from '../../api';

const { Text, Title } = Typography;

const MOCK_PLUGINS = [
  { id: 1, name: 'Web 搜索增强', description: '让 Agent 具备实时网络搜索能力', type: '搜索', status: 'active', version: '2.1.0', author: 'AIGC GEO', installedAt: '05/10', usageCount: 1234, rating: 4.8 },
  { id: 2, name: 'PDF 文档解析', description: 'PDF 文档的读取、解析和文本提取', type: '文档', status: 'active', version: '1.3.0', author: 'AIGC GEO', installedAt: '05/10', usageCount: 892, rating: 4.6 },
  { id: 3, name: '数据库查询连接器', description: '通过自然语言查询 MySQL/PostgreSQL', type: '数据', status: 'active', version: '1.0.0', author: '第三方', installedAt: '05/12', usageCount: 456, rating: 4.3 },
  { id: 4, name: '图像生成集成', description: '集成 DALL-E 和 Stable Diffusion 图像生成', type: '多媒体', status: 'inactive', version: '1.1.0', author: 'AIGC GEO', installedAt: '05/08', usageCount: 234, rating: 4.5 },
  { id: 5, name: 'Slack 通知集成', description: '将 Agent 执行结果发送到 Slack 频道', type: '通知', status: 'active', version: '2.0.0', author: '第三方', installedAt: '05/15', usageCount: 567, rating: 4.2 },
  { id: 6, name: 'Excel 数据处理', description: 'Excel 文件的读写和数据处理', type: '文档', status: 'active', version: '1.2.0', author: 'AIGC GEO', installedAt: '05/10', usageCount: 789, rating: 4.7 },
  { id: 7, name: '定时任务触发器', description: '按 Cron 表达式定时触发 Agent 任务', type: '调度', status: 'active', version: '1.0.0', author: 'AIGC GEO', installedAt: '05/11', usageCount: 345, rating: 4.4 },
  { id: 8, name: '邮件发送插件', description: '通过 SMTP 发送邮件，支持 HTML 模板', type: '通知', status: 'inactive', version: '1.0.0', author: '第三方', installedAt: '05/09', usageCount: 123, rating: 4.0 },
];

const MARKETPLACE_ITEMS = [
  { id: 'm1', name: 'Google Analytics 连接器', description: '连接 Google Analytics API 获取网站数据', type: '数据', author: '第三方', rating: 4.6, installs: 1200 },
  { id: 'm2', name: '微信公众平台集成', description: '对接微信公众号消息和文章管理', type: '社交', author: '第三方', rating: 4.8, installs: 890 },
  { id: 'm3', name: '飞书 Bot 集成', description: '与飞书机器人对接，支持消息推送', type: '通知', author: '第三方', rating: 4.5, installs: 670 },
  { id: 'm4', name: 'GitHub 代码分析', description: '分析 GitHub 仓库代码和 Issue', type: '开发', author: '第三方', rating: 4.7, installs: 1500 },
];

export default function Plugins() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [installModalVisible, setInstallModalVisible] = useState(false);
  const [marketplaceItems, setMarketplaceItems] = useState([]);

  useEffect(() => {
    fetchPlugins();
    fetchMarketplace();
  }, []);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const res = await pluginsApi.list();
      setPlugins(res.data || MOCK_PLUGINS);
    } catch (err) {
      setPlugins(MOCK_PLUGINS);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketplace = async () => {
    try {
      const res = await pluginsApi.getMarketplace();
      setMarketplaceItems(res.data || MARKETPLACE_ITEMS);
    } catch (err) {
      setMarketplaceItems(MARKETPLACE_ITEMS);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await pluginsApi.toggleStatus(id);
      message.success('状态已切换');
      fetchPlugins();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const handleInstall = async (pluginId) => {
    try {
      await pluginsApi.installFromMarket(pluginId);
      message.success('插件安装成功');
      setInstallModalVisible(false);
      fetchPlugins();
    } catch (err) {
      message.error('安装失败');
    }
  };

  const filteredPlugins = plugins.filter((p) => {
    if (searchText && !p.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    return true;
  });

  const pluginTypes = [...new Set(plugins.map((p) => p.type))];

  const columns = [
    {
      title: '插件名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: record.status === 'active'
                ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                : 'var(--bg-input)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              color: record.status === 'active' ? '#fff' : 'var(--text-muted)',
            }}
          >
            <AppstoreOutlined />
          </div>
          <div>
            <Text style={{ color: 'var(--text-white)', fontWeight: 600 }}>{text}</Text>
            <div>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{record.description}</Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type) => <Tag style={{ fontSize: 11 }}>{type}</Tag>,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100,
      render: (author) => (
        <Tag color={author === 'AIGC GEO' ? 'blue' : 'default'} style={{ fontSize: 11 }}>
          {author}
        </Tag>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (ver) => <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>v{ver}</Text>,
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      align: 'right',
      render: (count) => <Text style={{ color: 'var(--text-white)' }}>{count.toLocaleString()}</Text>,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      align: 'center',
      render: (rating) => (
        <Text style={{ color: 'var(--warning)' }}>
          {'★'.repeat(Math.floor(rating))} {rating}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          onChange={() => handleToggleStatus(record.id)}
          size="small"
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Space>
          <Tooltip title="设置">
            <Button type="text" icon={<EditOutlined />} style={{ color: 'var(--text-muted)' }} />
          </Tooltip>
          <Tooltip title="卸载">
            <Button type="text" icon={<DeleteOutlined />} danger onClick={async () => {
              try {
                await pluginsApi.delete(record.id);
                message.success('插件已卸载');
                fetchPlugins();
              } catch (err) {
                message.error('卸载失败');
              }
            }} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="加载插件列表..." />
      </div>
    );
  }

  const activeCount = plugins.filter((p) => p.status === 'active').length;

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
            插件管理
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            扩展 Agent 功能，共 {plugins.length} 个插件
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchPlugins}>
            刷新
          </Button>
          <Button type="primary" icon={<ShopOutlined />} onClick={() => setInstallModalVisible(true)}>
            插件市场
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={8} sm={6} lg={4}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="已安装" value={plugins.length} valueStyle={{ color: 'var(--text-white)' }} />
          </Card>
        </Col>
        <Col xs={8} sm={6} lg={4}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="启用中" value={activeCount} valueStyle={{ color: 'var(--success)' }} />
          </Card>
        </Col>
        <Col xs={8} sm={6} lg={4}>
          <Card bodyStyle={{ padding: 16, textAlign: 'center' }}>
            <Statistic title="类型" value={pluginTypes.length} suffix="种" valueStyle={{ color: 'var(--text-white)' }} />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card bodyStyle={{ padding: '12px 16px' }} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="搜索插件..."
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
                ...pluginTypes.map((t) => ({ value: t, label: t })),
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Plugin Table */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredPlugins}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description={<Text style={{ color: 'var(--text-muted)' }}>暂无插件</Text>} /> }}
        />
      </Card>

      {/* Marketplace Modal */}
      <Modal
        title="🛒 插件市场"
        open={installModalVisible}
        onCancel={() => setInstallModalVisible(false)}
        footer={null}
        width={640}
      >
        <Row gutter={[16, 16]}>
          {marketplaceItems.map((item) => (
            <Col xs={24} sm={12} key={item.id}>
              <Card
                hoverable
                bodyStyle={{ padding: 16 }}
                actions={[
                  <Button
                    type="primary"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleInstall(item.id)}
                  >
                    安装
                  </Button>,
                ]}
              >
                <div style={{ marginBottom: 8 }}>
                  <Text style={{ color: 'var(--text-white)', fontWeight: 600 }}>{item.name}</Text>
                </div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 12, display: 'block', marginBottom: 8 }}>
                  {item.description}
                </Text>
                <Space>
                  <Tag style={{ fontSize: 11 }}>{item.type}</Tag>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 11 }}>{item.author}</Text>
                  <Text style={{ color: 'var(--warning)', fontSize: 11 }}>★ {item.rating}</Text>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 11 }}>{item.installs} 安装</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
}
