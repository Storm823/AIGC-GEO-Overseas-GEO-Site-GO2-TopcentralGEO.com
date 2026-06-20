import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Spin,
  message,
  Row,
  Col,
  Tag,
  Divider,
  Tabs,
  Slider,
  Switch,
  InputNumber,
  Descriptions,
  Statistic,
  Modal,
  Tooltip,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  CopyOutlined,
  SettingOutlined,
  CodeOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { agentsApi } from '../../api';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const MOCK_AGENT = {
  id: 1,
  name: '内容生成 Agent V2',
  description: '基于 GPT-4 的自动化内容创作，支持多语言和多格式输出',
  status: 'online',
  model: 'gpt-4',
  category: '内容创作',
  systemPrompt: '你是一个专业的内容创作助手。根据用户的需求生成高质量、原创的文章内容。注意保持语言流畅、逻辑清晰、观点鲜明。',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.95,
  frequencyPenalty: 0.3,
  presencePenalty: 0.2,
  taskCount: 145,
  successRate: 98,
  tokenUsage: 45800,
  updatedAt: '2小时前',
  createdAt: '2026-01-15',
  creator: '管理员',
  tags: ['内容创作', 'GPT-4', '自动化'],
  apiEndpoint: '/api/v1/agents/1/execute',
  webhookUrl: '',
  timeout: 60,
  retryCount: 3,
};

const MODEL_OPTIONS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'gemini-pro', label: 'Gemini Pro' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: 'qwen-plus', label: '通义千问 Plus' },
];

const CATEGORY_OPTIONS = [
  { value: '内容创作', label: '内容创作' },
  { value: 'SEO', label: 'SEO' },
  { value: '数据分析', label: '数据分析' },
  { value: '客服', label: '客服' },
  { value: '翻译', label: '翻译' },
  { value: '开发', label: '开发' },
  { value: '市场', label: '市场' },
  { value: '知识管理', label: '知识管理' },
  { value: '其他', label: '其他' },
];

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agent, setAgent] = useState(null);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testRunning, setTestRunning] = useState(false);

  useEffect(() => {
    fetchAgent();
  }, [id]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const res = await agentsApi.getById(id);
      const data = res.data || MOCK_AGENT;
      setAgent(data);
      form.setFieldsValue(data);
    } catch (err) {
      setAgent(MOCK_AGENT);
      form.setFieldsValue(MOCK_AGENT);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      await agentsApi.update(id, values);
      message.success('Agent 配置已更新');
      fetchAgent();
    } catch (err) {
      if (err.message) message.error('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestRun = async () => {
    if (!testInput.trim()) {
      message.warning('请输入测试输入');
      return;
    }
    try {
      setTestRunning(true);
      const res = await agentsApi.testRun(id, { input: testInput });
      setTestResult(res.data?.output || res.data?.result || '测试执行完成，但未返回输出。');
    } catch (err) {
      // Simulate test output for demo
      setTimeout(() => {
        setTestResult(
          `# 测试输出\n\n根据您的输入，Agent 生成了以下内容：\n\n${testInput}\n\n---\n\n> 这是模拟输出。在实际环境中，将返回 Agent 的真实执行结果。\n\n**Token 消耗**: 243\n**执行时间**: 1.2s`
        );
        setTestRunning(false);
      }, 1500);
      return;
    } finally {
      setTestRunning(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="加载 Agent 详情..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/agents')}
            style={{ color: 'var(--text-muted)' }}
          />
          <div>
            <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
              {agent?.name || 'Agent 详情'}
            </Title>
            <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              ID: {id} · 创建于 {agent?.createdAt} · 由 {agent?.creator} 创建
            </Text>
          </div>
        </Space>
        <Space>
          <Button icon={<ExperimentOutlined />} onClick={() => setTestModalVisible(true)}>
            测试运行
          </Button>
          <Button icon={<CopyOutlined />} onClick={() => navigate(`/agents/create/${id}`)}>
            复制
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
            保存
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Main Config Form */}
        <Col xs={24} lg={16}>
          <Card bodyStyle={{ padding: 24 }}>
            <Tabs
              defaultActiveKey="basic"
              items={[
                {
                  key: 'basic',
                  label: <span><SettingOutlined /> 基本配置</span>,
                  children: (
                    <Form
                      form={form}
                      layout="vertical"
                      style={{ maxWidth: 800 }}
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="name" label="Agent 名称" rules={[{ required: true, message: '请输入名称' }]}>
                            <Input placeholder="输入 Agent 名称" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="category" label="分类">
                            <Select options={CATEGORY_OPTIONS} placeholder="选择分类" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name="description" label="描述">
                        <TextArea rows={2} placeholder="简要描述 Agent 的功能和用途" />
                      </Form.Item>

                      <Form.Item name="model" label="模型" rules={[{ required: true }]}>
                        <Select
                          options={MODEL_OPTIONS}
                          placeholder="选择 AI 模型"
                          showSearch
                        />
                      </Form.Item>

                      <Form.Item name="systemPrompt" label="系统提示词 (System Prompt)">
                        <TextArea
                          rows={6}
                          placeholder="输入系统级提示词，定义 Agent 的行为和角色"
                          style={{ fontFamily: 'monospace', fontSize: 13 }}
                        />
                      </Form.Item>

                      <Divider>模型参数</Divider>

                      <Row gutter={24}>
                        <Col span={12}>
                          <Form.Item name="temperature" label="Temperature (创造性)">
                            <Slider min={0} max={2} step={0.1} marks={{ 0: '精确', 1: '平衡', 2: '创造' }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="maxTokens" label="最大 Token 数">
                            <InputNumber min={64} max={32768} step={64} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={24}>
                        <Col span={8}>
                          <Form.Item name="topP" label="Top P">
                            <Slider min={0} max={1} step={0.05} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="frequencyPenalty" label="频率惩罚">
                            <Slider min={-2} max={2} step={0.1} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="presencePenalty" label="存在惩罚">
                            <Slider min={-2} max={2} step={0.1} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider>高级设置</Divider>

                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name="timeout" label="超时时间 (秒)">
                            <InputNumber min={5} max={300} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="retryCount" label="重试次数">
                            <InputNumber min={0} max={10} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="webhookUrl" label="Webhook URL">
                            <Input placeholder="https://..." />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  ),
                },
                {
                  key: 'api',
                  label: <span><CodeOutlined /> API 配置</span>,
                  children: (
                    <div>
                      <Descriptions column={1} colon={false} labelStyle={{ color: 'var(--text-secondary)' }} contentStyle={{ color: 'var(--text-primary)' }}>
                        <Descriptions.Item label="API Endpoint">
                          <Tag style={{ fontFamily: 'monospace' }}>{agent?.apiEndpoint}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="认证方式">
                          <Tag color="blue">Bearer Token</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="请求格式">
                          <Tag>JSON</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="调用示例">
                          <pre
                            style={{
                              background: 'var(--bg-input)',
                              padding: 12,
                              borderRadius: 6,
                              color: 'var(--text-primary)',
                              fontSize: 12,
                              overflow: 'auto',
                            }}
                          >
{`curl -X POST "${agent?.apiEndpoint}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "你的输入内容",
    "parameters": {}
  }'`}
                          </pre>
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  ),
                },
                {
                  key: 'history',
                  label: <span><HistoryOutlined /> 版本历史</span>,
                  children: (
                    <div>
                      <Text style={{ color: 'var(--text-muted)' }}>
                        版本历史功能将在后续版本中提供，敬请期待。
                      </Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* Sidebar - Stats & Info */}
        <Col xs={24} lg={8}>
          {/* Status Card */}
          <Card bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ color: 'var(--text-secondary)' }}>运行状态</Text>
              <Tag color={agent?.status === 'online' ? 'success' : agent?.status === 'error' ? 'error' : 'default'}>
                {agent?.status === 'online' ? '运行中' : agent?.status === 'error' ? '异常' : '已停止'}
              </Tag>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-white)' }}>{agent?.taskCount}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>总任务数</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 0', borderLeft: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{agent?.successRate}%</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>成功率</div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card title="标签" bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
            <Space wrap>
              {agent?.tags?.map((tag) => (
                <Tag key={tag} color="blue">{tag}</Tag>
              ))}
              <Button type="dashed" size="small" icon={<CopyOutlined />}>添加</Button>
            </Space>
          </Card>

          {/* Token Usage */}
          <Card title="Token 用量" bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
            <Statistic
              title="总消耗"
              value={agent?.tokenUsage ?? 0}
              suffix="Tokens"
              valueStyle={{ color: 'var(--text-white)' }}
            />
            <div style={{ marginTop: 12, padding: '8px 0', borderTop: '1px solid var(--border-color)' }}>
              <Space direction="vertical" style={{ width: '100%' }} size={4}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>今日</Text>
                  <Text style={{ color: 'var(--text-white)', fontSize: 12 }}>2,340</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>本周</Text>
                  <Text style={{ color: 'var(--text-white)', fontSize: 12 }}>15,670</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>本月</Text>
                  <Text style={{ color: 'var(--text-white)', fontSize: 12 }}>45,800</Text>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Test Run Modal */}
      <Modal
        title="🧪 测试运行 Agent"
        open={testModalVisible}
        onCancel={() => { setTestModalVisible(false); setTestResult(''); setTestInput(''); }}
        footer={null}
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>输入测试内容</Text>
          <TextArea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="输入要测试的内容..."
            rows={4}
          />
        </div>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleTestRun}
          loading={testRunning}
          style={{ marginBottom: 16 }}
        >
          运行测试
        </Button>
        {testResult && (
          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: 16,
              minHeight: 100,
              maxHeight: 400,
              overflow: 'auto',
            }}
          >
            <Text style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
              {testResult}
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
}
