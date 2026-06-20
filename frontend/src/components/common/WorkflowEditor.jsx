import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Typography, Tag, Space, Tooltip, Dropdown, Empty, Spin, message, Modal, Input } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  LinkOutlined,
  BranchesOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import { workflowApi } from '../../api';

const { Text, Title } = Typography;

// Node types for the workflow palette
const NODE_TYPES = {
  start: { label: '开始', icon: '▶', color: '#00c853', category: '基础' },
  end: { label: '结束', icon: '■', color: '#ff5252', category: '基础' },
  'llm-call': { label: 'LLM 调用', icon: '🧠', color: '#1a73e8', category: 'AI' },
  'tool-call': { label: '工具调用', icon: '🔧', color: '#ffd600', category: '工具' },
  condition: { label: '条件判断', icon: '◇', color: '#ff9100', category: '逻辑' },
  transform: { label: '数据转换', icon: '↔', color: '#40c4ff', category: '数据' },
  code: { label: '代码执行', icon: '</>', color: '#e040fb', category: '高级' },
  input: { label: '用户输入', icon: '📝', color: '#64ffda', category: '交互' },
  output: { label: '输出处理', icon: '📤', color: '#9e9e9e', category: '交互' },
  parallel: { label: '并行分支', icon: '⚡', color: '#ff6d00', category: '流程' },
};

// Simple workflow node component
function WorkflowNode({ node, selected, onSelect, onDelete, onConnect }) {
  const nodeType = NODE_TYPES[node.type] || { label: node.type, icon: '❓', color: '#888' };

  return (
    <div
      className={`workflow-node ${node.type}-node`}
      onClick={() => onSelect(node)}
      style={{
        borderColor: selected ? nodeType.color : undefined,
        boxShadow: selected ? `0 0 12px ${nodeType.color}40` : undefined,
        position: 'relative',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 4 }}>{nodeType.icon}</div>
      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-white)' }}>
        {node.data?.label || nodeType.label}
      </div>
      {node.data?.model && (
        <Tag style={{ fontSize: 10, marginTop: 4 }}>{node.data.model}</Tag>
      )}
      <div
        style={{
          position: 'absolute',
          top: -6,
          right: -6,
          display: 'flex',
          gap: 4,
          opacity: selected ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      >
        <Tooltip title="删除节点">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            style={{ fontSize: 11 }}
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          />
        </Tooltip>
      </div>
    </div>
  );
}

// Node property editor
function NodeEditor({ node, onUpdate }) {
  if (!node) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
        <BranchesOutlined style={{ fontSize: 32, marginBottom: 12 }} />
        <Text style={{ color: 'var(--text-muted)', display: 'block' }}>
          选择一个节点进行配置
        </Text>
      </div>
    );
  }

  const nodeType = NODE_TYPES[node.type] || {};

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{nodeType.icon}</span>
        <div>
          <Title level={5} style={{ margin: 0, color: 'var(--text-white)', fontSize: 14 }}>
            {node.data?.label || nodeType.label}
          </Title>
          <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>ID: {node.id}</Text>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Text style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4, display: 'block' }}>
          节点名称
        </Text>
        <Input
          value={node.data?.label || ''}
          onChange={(e) => onUpdate(node.id, { ...node.data, label: e.target.value })}
          placeholder="输入节点名称"
          size="small"
        />
      </div>

      {node.type === 'llm-call' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <Text style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4, display: 'block' }}>
              Model
            </Text>
            <Input
              value={node.data?.model || 'gpt-4'}
              onChange={(e) => onUpdate(node.id, { ...node.data, model: e.target.value })}
              size="small"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Text style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4, display: 'block' }}>
              System Prompt
            </Text>
            <Input.TextArea
              value={node.data?.systemPrompt || ''}
              onChange={(e) => onUpdate(node.id, { ...node.data, systemPrompt: e.target.value })}
              placeholder="输入系统提示词"
              rows={3}
              size="small"
            />
          </div>
          <div>
            <Text style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4, display: 'block' }}>
              Temperature
            </Text>
            <Input
              value={node.data?.temperature ?? 0.7}
              onChange={(e) => onUpdate(node.id, { ...node.data, temperature: parseFloat(e.target.value) || 0.7 })}
              type="number"
              min={0}
              max={2}
              step={0.1}
              size="small"
            />
          </div>
        </>
      )}

      {node.type === 'condition' && (
        <div style={{ marginBottom: 12 }}>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4, display: 'block' }}>
            条件表达式
          </Text>
          <Input.TextArea
            value={node.data?.condition || ''}
            onChange={(e) => onUpdate(node.id, { ...node.data, condition: e.target.value })}
            placeholder="例如: {{output.score > 0.8}}"
            rows={2}
            size="small"
          />
        </div>
      )}

      {node.type === 'tool-call' && (
        <div style={{ marginBottom: 12 }}>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4, display: 'block' }}>
            工具选择
          </Text>
          <Input
            value={node.data?.tool || ''}
            onChange={(e) => onUpdate(node.id, { ...node.data, tool: e.target.value })}
            placeholder="选择或输入工具名称"
            size="small"
          />
        </div>
      )}
    </div>
  );
}

export default function WorkflowEditor({ workflowId, onSave }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [showPalette, setShowPalette] = useState(false);
  const [nextId, setNextId] = useState(1);
  const canvasRef = useRef(null);
  const dragNodeRef = useRef(null);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadWorkflow = async (id) => {
    try {
      setLoading(true);
      const res = await workflowApi.getById(id);
      const data = res.data;
      setWorkflowName(data.name);
      setNodes(data.config?.nodes || []);
      setEdges(data.config?.edges || []);
      setNextId((data.config?.nodes?.length || 0) + 1);
    } catch (err) {
      message.error('加载工作流失败: ' + err.message);
      setNodes([]);
      setEdges([]);
    } finally {
      setLoading(false);
    }
  };

  const addNode = (type) => {
    const nodeType = NODE_TYPES[type];
    const newNode = {
      id: `node_${nextId}`,
      type,
      data: {
        label: `${nodeType?.label || type} ${nextId}`,
        ...(type === 'llm-call' ? { model: 'gpt-4', temperature: 0.7, systemPrompt: '' } : {}),
        ...(type === 'condition' ? { condition: '' } : {}),
        ...(type === 'tool-call' ? { tool: '' } : {}),
      },
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
    };
    setNodes([...nodes, newNode]);
    setNextId(nextId + 1);
    setShowPalette(false);
  };

  const updateNode = (id, data) => {
    setNodes(nodes.map((n) => (n.id === id ? { ...n, data } : n)));
    if (selectedNode?.id === id) {
      setSelectedNode({ ...selectedNode, data });
    }
  };

  const deleteNode = (id) => {
    setNodes(nodes.filter((n) => n.id !== id));
    setEdges(edges.filter((e) => e.source !== id && e.target !== id));
    if (selectedNode?.id === id) {
      setSelectedNode(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: workflowName || '未命名工作流',
        config: { nodes, edges },
      };
      if (workflowId) {
        await workflowApi.update(workflowId, payload);
      } else {
        await workflowApi.create(payload);
      }
      message.success('工作流已保存');
      onSave?.();
    } catch (err) {
      message.error('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const config = { nodes, edges };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName || 'workflow'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 200px)', minHeight: 500 }}>
      {/* Left - Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
          }}
        >
          <Space>
            <Dropdown
              open={showPalette}
              onOpenChange={setShowPalette}
              dropdownRender={() => (
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    padding: 8,
                    width: 220,
                  }}
                >
                  {Object.entries(
                    [...new Set(Object.values(NODE_TYPES).map((n) => n.category))]
                  ).map(([_, category]) => (
                    <div key={category} style={{ marginBottom: 8 }}>
                      <Text style={{ color: 'var(--text-muted)', fontSize: 11, padding: '0 8px', display: 'block', marginBottom: 4 }}>
                        {category}
                      </Text>
                      {Object.entries(NODE_TYPES)
                        .filter(([_, nt]) => nt.category === category)
                        .map(([type, nt]) => (
                          <div
                            key={type}
                            onClick={() => addNode(type)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '6px 8px',
                              borderRadius: 4,
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(26,115,232,0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <span style={{ fontSize: 16 }}>{nt.icon}</span>
                            <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{nt.label}</span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            >
              <Button type="primary" icon={<PlusOutlined />}>
                添加节点
              </Button>
            </Dropdown>
          </Space>

          <Space>
            <Button icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              保存
            </Button>
            <Button onClick={handleExport}>
              导出
            </Button>
            <Button type="primary" icon={<PlayCircleOutlined />}>
              运行
            </Button>
          </Space>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          style={{
            flex: 1,
            background: `radial-gradient(circle at 1px 1px, var(--border-color) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
            position: 'relative',
            overflow: 'auto',
            padding: 24,
          }}
        >
          {nodes.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text style={{ color: 'var(--text-muted)' }}>
                    点击"添加节点"开始构建工作流
                  </Text>
                }
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowPalette(true)} style={{ marginTop: 16 }}>
                添加第一个节点
              </Button>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start', justifyContent: 'center' }}>
              {nodes.map((node, idx) => (
                <WorkflowNode
                  key={node.id}
                  node={node}
                  selected={selectedNode?.id === node.id}
                  onSelect={setSelectedNode}
                  onDelete={deleteNode}
                  onConnect={() => {}}
                />
              ))}
              {/* Simple connection lines between consecutive nodes */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {nodes.slice(0, -1).map((node, idx) => {
                  const next = nodes[idx + 1];
                  return (
                    <line
                      key={`edge-${idx}`}
                      x1="50%"
                      y1="100%"
                      x2="50%"
                      y2="0"
                      stroke="var(--border-color)"
                      strokeWidth={2}
                      strokeDasharray="6,4"
                    />
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Right - Property Panel */}
      <div
        style={{
          width: 300,
          borderLeft: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="工作流名称"
            bordered={false}
            style={{ color: 'var(--text-white)', fontSize: 15, fontWeight: 600, padding: 0 }}
          />
          <Text style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            {nodes.length} 个节点 · {edges.length} 条连线
          </Text>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <NodeEditor node={selectedNode} onUpdate={updateNode} />
        </div>
      </div>
    </div>
  );
}
