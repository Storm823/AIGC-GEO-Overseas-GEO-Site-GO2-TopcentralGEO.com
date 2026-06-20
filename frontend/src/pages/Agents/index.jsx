import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Select,
  Tag,
  Typography,
  Space,
  Spin,
  Empty,
  Modal,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { agentsApi } from '../../api';
import AgentCard from '../../components/common/AgentCard';
import ChatWindow from '../../components/common/ChatWindow';

const { Text, Title } = Typography;

const MOCK_AGENTS = [
  { id: 1, name: '内容生成 Agent V2', description: '基于 GPT-4 的自动化内容创作，支持多语言和多格式输出', status: 'online', model: 'gpt-4', taskCount: 145, successRate: 98, tokenUsage: 45800, updatedAt: '2小时前', category: '内容创作' },
  { id: 2, name: 'SEO 优化 Agent', description: '自动分析网站SEO表现并提供优化建议', status: 'online', model: 'gpt-4', taskCount: 89, successRate: 92, tokenUsage: 32100, updatedAt: '1小时前', category: 'SEO' },
  { id: 3, name: '数据分析 Agent', description: '数据采集、清洗、分析和可视化报告生成', status: 'busy', model: 'claude-3', taskCount: 234, successRate: 88, tokenUsage: 89200, updatedAt: '30分钟前', category: '数据分析' },
  { id: 4, name: '客服对话 Agent', description: '7x24小时智能客服，支持多渠道接入', status: 'online', model: 'gpt-3.5', taskCount: 567, successRate: 95, tokenUsage: 156700, updatedAt: '5分钟前', category: '客服' },
  { id: 5, name: '知识库 Agent', description: '企业内部知识库问答系统', status: 'offline', model: 'gpt-4', taskCount: 0, successRate: 0, tokenUsage: 0, updatedAt: '3天前', category: '知识管理' },
  { id: 6, name: '翻译 Agent', description: '支持50+语言的互译，保留原文格式', status: 'online', model: 'gpt-4', taskCount: 312, successRate: 96, tokenUsage: 123400, updatedAt: '15分钟前', category: '翻译' },
  { id: 7, name: '代码审查 Agent', description: '自动代码审查和Bug检测', status: 'online', model: 'claude-3', taskCount: 78, successRate: 91, tokenUsage: 45600, updatedAt: '1小时前', category: '开发' },
  { id: 8, name: '市场分析 Agent', description: '竞品分析和市场趋势报告生成', status: 'error', model: 'gpt-4', taskCount: 45, successRate: 72, tokenUsage: 28900, updatedAt: '4小时前', category: '市场' },
];

const statusFilters = [
  { value: 'all', label: '全部状态' },
  { value: 'online', label: '运行中' },
  { value: 'offline', label: '已停止' },
  { value: 'error', label: '异常' },
  { value: 'busy', label: '繁忙' },
];

export default function Agents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [chatPanelVisible, setChatPanelVisible] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await agentsApi.list();
      setAgents(res.data || MOCK_AGENTS);
    } catch (err) {
      setAgents(MOCK_AGENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await agentsApi.delete(deleteTarget);
      setAgents(agents.filter((a) => a.id !== deleteTarget));
      message.success('Agent 已删除');
    } catch (err) {
      message.error('删除失败: ' + err.message);
    } finally {
      setDeleteModalVisible(false);
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (id) => {
    navigate(`/agents/create/${id}`);
  };

  const handleToggle = async (id) => {
    try {
      await agentsApi.toggleStatus(id);
      message.success('状态已切换');
      fetchAgents();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchSearch = !searchText ||
      agent.name.toLowerCase().includes(searchText.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="加载 Agent 列表..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
            Agent 管理
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            管理所有 AI Agent，共 {agents.length} 个
          </Text>
        </div>
        <Space>
          <Button
            icon={<MessageOutlined />}
            onClick={() => setChatPanelVisible(!chatPanelVisible)}
            type={chatPanelVisible ? 'primary' : 'default'}
            style={chatPanelVisible ? { background: 'linear-gradient(135deg, #64ffda, #1a73e8)', border: 'none' } : {}}
          >
            Chat 调试
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/agents/create')}
            size="large"
          >
            创建 Agent
          </Button>
        </Space>
      </div>

      {/* Dual-Pane Layout: Chat Debug + Agent List */}
      {chatPanelVisible ? (
        <Row gutter={[16, 16]}>
          {/* Left: Agent Selector */}
          <Col xs={24} md={8} lg={6}>
            <Card
              title={<Text style={{ color: 'var(--text-white)' }}>选择 Agent</Text>}
              bodyStyle={{ padding: 0, maxHeight: 600, overflowY: 'auto' }}
              style={{ border: '1px solid var(--border-color)' }}
            >
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => { setSelectedAgent(agent); }}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-color)',
                    background: selectedAgent?.id === agent.id ? 'rgba(26,115,232,0.1)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.background = 'rgba(26,115,232,0.05)'; }}
                  onMouseLeave={(e) => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Space>
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 14,
                      }}
                    >
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <Text style={{ color: 'var(--text-white)', fontSize: 13, display: 'block' }}>{agent.name}</Text>
                      <Text style={{ color: 'var(--text-muted)', fontSize: 11 }}>{agent.model}</Text>
                    </div>
                  </Space>
                </div>
              ))}
            </Card>
          </Col>
          {/* Right: Chat Window */}
          <Col xs={24} md={16} lg={18}>
            <Card
              bodyStyle={{ padding: 0, height: 600, display: 'flex', flexDirection: 'column' }}
              style={{ border: '1px solid var(--border-color)', overflow: 'hidden' }}
            >
              <ChatWindow agent={selectedAgent} onClose={() => setChatPanelVisible(false)} />
            </Card>
          </Col>
        </Row>
      ) : (

      {/* Filters */}
      <Card bodyStyle={{ padding: '12px 20px' }} style={{ marginBottom: 24 }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="搜索 Agent 名称或描述..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              options={statusFilters}
            />
          </Col>
          <Col flex="auto">
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Tooltip title="网格视图">
                <Button
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('grid')}
                />
              </Tooltip>
              <Tooltip title="列表视图">
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode('list')}
                />
              </Tooltip>
              <Button icon={<ReloadOutlined />} onClick={fetchAgents}>
                刷新
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Agent List / Grid */}
      {filteredAgents.length === 0 ? (
        <Empty
          description={<Text style={{ color: 'var(--text-muted)' }}>没有找到匹配的 Agent</Text>}
          style={{ margin: '60px 0' }}
        />
      ) : viewMode === 'grid' ? (
        <Row gutter={[16, 16]}>
          {filteredAgents.map((agent) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={agent.id}>
              <AgentCard
                agent={agent}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onToggle={handleToggle}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Card bodyStyle={{ padding: 0 }}>
          {filteredAgents.map((agent, idx) => (
            <div
              key={agent.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                borderBottom: idx < filteredAgents.length - 1 ? '1px solid var(--border-color)' : 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={() => navigate(`/agents/${agent.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26,115,232,0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 16,
                  marginRight: 12,
                  flexShrink: 0,
                }}
              >
                {agent.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: 'var(--text-white)', fontWeight: 600, fontSize: 14 }}>
                    {agent.name}
                  </Text>
                  <span className={`status-dot ${agent.status}`} />
                  <Tag style={{ fontSize: 11 }}>{agent.model}</Tag>
                  <Tag style={{ fontSize: 11 }}>{agent.category}</Tag>
                </div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }} ellipsis>
                  {agent.description}
                </Text>
              </div>
              <div style={{ display: 'flex', gap: 24, textAlign: 'center', flexShrink: 0 }}>
                <div>
                  <div style={{ color: 'var(--text-white)', fontSize: 14, fontWeight: 600 }}>{agent.taskCount}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>任务数</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-white)', fontSize: 14, fontWeight: 600 }}>{agent.successRate}%</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>成功率</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{agent.updatedAt}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>更新时间</div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </>
      )}

      {/* Delete Confirmation */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => { setDeleteModalVisible(false); setDeleteTarget(null); }}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <Text style={{ color: 'var(--text-primary)' }}>
          确定要删除这个 Agent 吗？此操作不可撤销，相关的任务和配置将会被清除。
        </Text>
      </Modal>
    </div>
  );
}
