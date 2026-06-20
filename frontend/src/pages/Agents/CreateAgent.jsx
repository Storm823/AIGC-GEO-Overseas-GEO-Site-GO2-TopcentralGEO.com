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
  Tabs,
  Slider,
  InputNumber,
  Divider,
  Steps,
  Result,
  Alert,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  RobotOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { agentsApi } from '../../api';

const { Text, Title } = Typography;
const { TextArea } = Input;

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

const TEMPLATES = [
  {
    title: '内容生成',
    description: '基于 AI 的自动化内容创作 Agent',
    preset: {
      name: '内容生成 Agent',
      description: '基于 AI 的自动化内容创作，支持多语言和多格式输出',
      category: '内容创作',
      model: 'gpt-4',
      systemPrompt: '你是一个专业的内容创作助手。根据用户的需求生成高质量、原创的文章内容。注意保持语言流畅、逻辑清晰、观点鲜明。',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 0.95,
    },
  },
  {
    title: '客服助手',
    description: '7x24小时智能客服响应',
    preset: {
      name: '客服助手',
      description: '智能客服 Agent，支持多渠道接入和自动回复',
      category: '客服',
      model: 'gpt-3.5-turbo',
      systemPrompt: '你是一个专业的客服助手。礼貌、专业地解答用户的问题。如果你不知道答案，引导用户联系人工客服。',
      temperature: 0.5,
      maxTokens: 2048,
      topP: 0.9,
    },
  },
  {
    title: '数据分析',
    description: '数据采集与分析 Agent',
    preset: {
      name: '数据分析 Agent',
      description: '自动化数据采集、清洗、分析和可视化报告生成',
      category: '数据分析',
      model: 'claude-3-sonnet',
      systemPrompt: '你是一个数据分析专家。帮助用户分析数据、发现趋势、生成可视化报告。提供数据驱动的洞察和建议。',
      temperature: 0.3,
      maxTokens: 8192,
      topP: 0.9,
    },
  },
];

const MOCK_SOURCE_AGENT = {
  id: 1,
  name: '内容生成 Agent V2',
  description: '基于 GPT-4 的自动化内容创作',
  model: 'gpt-4',
  category: '内容创作',
  systemPrompt: '你是一个专业的内容创作助手。根据用户的需求生成高质量、原创的文章内容。',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.95,
  frequencyPenalty: 0.3,
  presencePenalty: 0.2,
  timeout: 60,
  retryCount: 3,
};

export default function CreateAgent() {
  const { duplicateId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);
  const [newAgentId, setNewAgentId] = useState(null);

  useEffect(() => {
    if (duplicateId) {
      loadSourceAgent(duplicateId);
    }
  }, [duplicateId]);

  const loadSourceAgent = async (id) => {
    try {
      setLoading(true);
      const res = await agentsApi.getById(id);
      const data = res.data || MOCK_SOURCE_AGENT;
      form.setFieldsValue({
        ...data,
        name: `${data.name} (副本)`,
      });
      message.info('已加载源 Agent 配置');
    } catch (err) {
      form.setFieldsValue(MOCK_SOURCE_AGENT);
      form.setFieldValue('name', `${MOCK_SOURCE_AGENT.name} (副本)`);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template) => {
    form.setFieldsValue(template.preset);
    message.success(`已应用「${template.title}」模板`);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      const res = await agentsApi.create(values);
      const id = res.data?.id || Math.floor(Math.random() * 10000);
      setNewAgentId(id);
      setCreated(true);
      message.success('Agent 创建成功！');
    } catch (err) {
      if (err.message) message.error('创建失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (created) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="success"
          title="Agent 创建成功！"
          subTitle={
            <Text style={{ color: 'var(--text-secondary)' }}>
              Agent 「{form.getFieldValue('name')}」已准备就绪
            </Text>
          }
          extra={[
            <Button type="primary" key="view" onClick={() => navigate(`/agents/${newAgentId}`)}>
              查看 Agent 详情
            </Button>,
            <Button key="list" onClick={() => navigate('/agents')}>
              返回列表
            </Button>,
            <Button key="new" onClick={() => { setCreated(false); form.resetFields(); setCurrentStep(0); }}>
              继续创建
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="加载源 Agent 配置..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/agents')}
          style={{ color: 'var(--text-muted)' }}
        />
        <div>
          <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
            {duplicateId ? '复制 Agent' : '创建新 Agent'}
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {duplicateId ? '基于现有 Agent 创建副本' : '配置一个新的 AI Agent'}
          </Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card bodyStyle={{ padding: 0 }}>
            {!duplicateId && (
              <div style={{ padding: '24px 24px 0' }}>
                <Steps
                  current={currentStep}
                  onChange={setCurrentStep}
                  items={[
                    { title: '选择模板', description: '快速开始' },
                    { title: '基础配置', description: '名称与模型' },
                    { title: '高级参数', description: '模型调优' },
                    { title: '确认创建', description: '完成' },
                  ]}
                />
              </div>
            )}

            <div style={{ padding: 24 }}>
              {currentStep === 0 && !duplicateId && (
                <div>
                  <Title level={5} style={{ color: 'var(--text-white)', marginBottom: 16 }}>
                    选择一个模板快速开始，或自行配置
                  </Title>
                  <Row gutter={[16, 16]}>
                    {TEMPLATES.map((template, idx) => (
                      <Col xs={24} sm={8} key={idx}>
                        <Card
                          hoverable
                          onClick={() => applyTemplate(template)}
                          style={{ textAlign: 'center', cursor: 'pointer', height: '100%' }}
                          bodyStyle={{ padding: 24 }}
                        >
                          <RobotOutlined style={{ fontSize: 36, color: 'var(--primary)', marginBottom: 12 }} />
                          <Title level={5} style={{ color: 'var(--text-white)', margin: '0 0 8px' }}>
                            {template.title}
                          </Title>
                          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                            {template.description}
                          </Text>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <div style={{ textAlign: 'right', marginTop: 24 }}>
                    <Button type="primary" onClick={() => setCurrentStep(1)}>
                      自行配置 →
                    </Button>
                  </div>
                </div>
              )}

              {(currentStep === 1 || currentStep === 2 || duplicateId) && (
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    temperature: 0.7,
                    maxTokens: 4096,
                    topP: 0.95,
                    frequencyPenalty: 0,
                    presencePenalty: 0,
                    timeout: 60,
                    retryCount: 3,
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="name" label="Agent 名称" rules={[{ required: true, message: '请输入名称' }]}>
                        <Input placeholder="例如：内容生成 Agent" />
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

                  <Form.Item name="model" label="AI 模型" rules={[{ required: true, message: '请选择模型' }]}>
                    <Select options={MODEL_OPTIONS} placeholder="选择 AI 模型" showSearch />
                  </Form.Item>

                  <Form.Item name="systemPrompt" label="系统提示词 (System Prompt)">
                    <TextArea
                      rows={6}
                      placeholder="输入系统级提示词，定义 Agent 的行为、角色和约束条件"
                      style={{ fontFamily: 'monospace', fontSize: 13 }}
                    />
                  </Form.Item>

                  {currentStep === 2 && (
                    <>
                      <Divider>模型参数</Divider>
                      <Row gutter={24}>
                        <Col span={12}>
                          <Form.Item name="temperature" label="Temperature">
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
                      <Divider>运行配置</Divider>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name="timeout" label="超时 (秒)">
                            <InputNumber min={5} max={300} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="retryCount" label="重试次数">
                            <InputNumber min={0} max={10} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}
                </Form>
              )}

              {currentStep === 3 && !duplicateId && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <ExperimentOutlined style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} />
                  <Title level={5} style={{ color: 'var(--text-white)', marginBottom: 8 }}>
                    确认配置
                  </Title>
                  <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 24 }}>
                    请检查以下配置，确认无误后创建
                  </Text>
                  <Alert
                    message="配置预览"
                    description={
                      <div>
                        <p><strong>名称：</strong>{form.getFieldValue('name') || '-'}</p>
                        <p><strong>模型：</strong>{form.getFieldValue('model') || '-'}</p>
                        <p><strong>分类：</strong>{form.getFieldValue('category') || '-'}</p>
                        <p><strong>Temperature：</strong>{form.getFieldValue('temperature')}</p>
                        <p><strong>Max Tokens：</strong>{form.getFieldValue('maxTokens')}</p>
                      </div>
                    }
                    type="info"
                    style={{ marginBottom: 24, textAlign: 'left' }}
                  />
                </div>
              )}

              {/* Step Navigation */}
              {!duplicateId && currentStep > 0 && currentStep < 3 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <Button onClick={() => setCurrentStep(currentStep - 1)}>
                    上一步
                  </Button>
                  <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                    下一步
                  </Button>
                </div>
              )}

              {(currentStep === 3 || duplicateId) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                  <Button onClick={() => navigate('/agents')}>
                    取消
                  </Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={saving}>
                    {duplicateId ? '创建副本' : '创建 Agent'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Sidebar Tips */}
        <Col xs={24} lg={6}>
          <Card bodyStyle={{ padding: 16 }}>
            <Title level={5} style={{ color: 'var(--text-white)', fontSize: 14, marginBottom: 12 }}>
              💡 创建提示
            </Title>
            <Space direction="vertical" size={8}>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                1. 选择一个合适的名称和分类
              </Text>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                2. 编写清晰的系统提示词
              </Text>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                3. 根据任务复杂度调整模型参数
              </Text>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                4. 创建后可以随时测试和调整
              </Text>
              <Divider style={{ margin: '8px 0' }} />
              <Text style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                提示：可以从现有 Agent 复制配置快速创建新 Agent。
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
