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
} from 'antd';
import {
  PlusOutlined,
  ApartmentOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  DeleteOutlined,
  CopyOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { workflowApi } from '../../api';
import WorkflowEditor from '../../components/common/WorkflowEditor';

const { Text, Title } = Typography;

const MOCK_WORKFLOWS = [
  { id: 1, name: 'SEO 内容批处理', description: '批量生成 SEO 优化的文章内容', status: 'active', nodeCount: 8, runCount: 234, lastRun: '5分钟前', updatedAt: '1小时前' },
  { id: 2, name: '数据分析 Pipeline', description: '数据采集、清洗到可视化报告的全流程', status: 'active', nodeCount: 12, runCount: 89, lastRun: '30分钟前', updatedAt: '2小时前' },
  { id: 3, name: '客服自动回复流程', description: '用户咨询自动分发和回复处理', status: 'paused', nodeCount: 6, runCount: 567, lastRun: '1天前', updatedAt: '3天前' },
  { id: 4, name: '多语言翻译 Pipeline', description: '内容多语言翻译和本地化处理', status: 'active', nodeCount: 5, runCount: 156, lastRun: '15分钟前', updatedAt: '30分钟前' },
  { id: 5, name: '市场分析报告生成', description: '自动生成市场趋势分析报告', status: 'draft', nodeCount: 10, runCount: 0, lastRun: '-', updatedAt: '5天前' },
  { id: 6, name: '代码审查流程', description: '自动代码审查和 Bug 检测', status: 'active', nodeCount: 7, runCount: 78, lastRun: '1小时前', updatedAt: '4小时前' },
];

export default function Workflow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(id ? 'editor' : 'list');
  const [currentWorkflowId, setCurrentWorkflowId] = useState(id || null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  useEffect(() => {
    if (id) {
      setCurrentWorkflowId(id);
      setView('editor');
    } else {
      fetchWorkflows();
    }
  }, [id]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await workflowApi.list();
      setWorkflows(res.data || MOCK_WORKFLOWS);
    } catch (err) {
      setWorkflows(MOCK_WORKFLOWS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const values = await createForm.validateFields();
      const res = await workflowApi.create(values);
      const newId = res.data?.id || Math.floor(Math.random() * 10000);
      message.success('工作流已创建');
      setCreateModalVisible(false);
      createForm.resetFields();
      navigate(`/workflow/${newId}`);
    } catch (err) {
      if (err.message) message.error('创建失败: ' + err.message);
    }
  };

  const handleDelete = async (workflowId) => {
    try {
      await workflowApi.delete(workflowId);
      message.success('工作流已删除');
      fetchWorkflows();
    } catch (err) {
      message.error('删除失败');
    }
  };

  if (view === 'editor') {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Button onClick={() => { navigate('/workflow'); setView('list'); }} style={{ marginRight: 12 }}>
            ← 返回列表
          </Button>
        </div>
        <WorkflowEditor
          workflowId={currentWorkflowId}
          onSave={() => {
            if (!currentWorkflowId) {
              fetchWorkflows();
            }
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="加载工作流列表..." />
      </div>
    );
  }

  const columns = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ApartmentOutlined style={{ color: 'var(--primary)', fontSize: 18 }} />
          <div>
            <Text
              style={{ color: 'var(--text-white)', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => navigate(`/workflow/${record.id}`)}
            >
              {text}
            </Text>
            <div>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{record.description}</Text>
            </div>
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
        <Tag color={status === 'active' ? 'success' : status === 'paused' ? 'warning' : 'default'}>
          {status === 'active' ? '运行中' : status === 'paused' ? '已暂停' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '节点数',
      dataIndex: 'nodeCount',
      key: 'nodeCount',
      width: 80,
      align: 'center',
      render: (count) => <Text style={{ color: 'var(--text-white)' }}>{count}</Text>,
    },
    {
      title: '运行次数',
      dataIndex: 'runCount',
      key: 'runCount',
      width: 100,
      align: 'center',
      render: (count) => <Badge count={count} showZero style={{ background: count > 0 ? 'var(--primary)' : 'var(--text-muted)' }} overflowCount={999} />,
    },
    {
      title: '上次运行',
      dataIndex: 'lastRun',
      key: 'lastRun',
      width: 120,
      render: (text) => (
        <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {text}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/workflow/${record.id}`)}
              style={{ color: 'var(--text-muted)' }}
            />
          </Tooltip>
          <Tooltip title="运行">
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              style={{ color: 'var(--success)' }}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              icon={<CopyOutlined />}
              style={{ color: 'var(--text-muted)' }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
            工作流管理
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            创建和管理 AI 工作流自动化流程
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchWorkflows}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            创建工作流
          </Button>
        </Space>
      </div>

      {/* Workflow List */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={workflows}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                description={<Text style={{ color: 'var(--text-muted)' }}>暂无工作流</Text>}
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                  创建第一个工作流
                </Button>
              </Empty>
            ),
          }}
        />
      </Card>

      {/* Create Workflow Modal */}
      <Modal
        title="创建工作流"
        open={createModalVisible}
        onOk={handleCreateWorkflow}
        onCancel={() => { setCreateModalVisible(false); createForm.resetFields(); }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="name"
            label="工作流名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="例如：SEO 内容批处理" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="描述工作流的用途" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
