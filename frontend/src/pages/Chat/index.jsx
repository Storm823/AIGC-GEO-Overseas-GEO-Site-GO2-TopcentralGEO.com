import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Avatar, Tooltip, Tag, Badge, Space, Typography, Empty, Spin } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, CloseOutlined, MinusOutlined, FullscreenOutlined, ClearOutlined, MessageOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

const SmarTOPChat = ({ visible, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'agent', content: '您好！我是小锋™，坚锋Topcentral的AI智能助手。我可以帮您查询Agent状态、分配任务、分析关键词、检索知识库，请随时提问。', agent: '小锋' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [agents, setAgents] = useState([]);
  const [activeAgent, setActiveAgent] = useState('all');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 加载可对话的Agent列表
    fetch('/api/agents?status=active&limit=20')
      .then(r => r.json())
      .then(data => setAgents(data.items || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input, agent: '我' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/smartop/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, agent_id: activeAgent !== 'all' ? activeAgent : undefined })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'agent',
        content: data.reply || '抱歉，我暂时无法回答这个问题。',
        agent: data.agent_name || '小锋',
        agent_id: data.agent_id,
        data: data.data
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'agent', content: '网络连接失败，请检查后端服务。', agent: '小锋' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: 'agent', content: '会话已清空。有任何问题请随时问我！', agent: '小锋' }]);
  };

  if (!visible) return null;

  const chatContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Space>
          <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#64ffda', color: '#0a0e27' }} />
          <div>
            <Text strong style={{ color: '#fff', fontSize: 14 }}>小锋™ AI助手</Text>
            <br />
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>坚锋智能中枢 · 多Agent协同</Text>
          </div>
        </Space>
        <Space>
          <Tooltip title="清空对话">
            <Button size="small" type="text" icon={<ClearOutlined />} onClick={clearChat} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </Tooltip>
          <Tooltip title="最小化">
            <Button size="small" type="text" icon={<MinusOutlined />} onClick={() => setMinimized(true)} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </Tooltip>
          <Tooltip title="关闭">
            <Button size="small" type="text" icon={<CloseOutlined />} onClick={onClose} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </Tooltip>
        </Space>
      </div>

      {/* Agent Selector */}
      <div style={{ padding: '8px 16px', background: '#131a3a', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, overflowX: 'auto' }}>
        <Space wrap>
          <Tag
            style={{ cursor: 'pointer', borderColor: activeAgent === 'all' ? '#64ffda' : 'transparent' }}
            color={activeAgent === 'all' ? '#64ffda' : '#1a1a3a'}
            onClick={() => setActiveAgent('all')}
          >全部Agent</Tag>
          {agents.slice(0, 8).map(a => (
            <Tag
              key={a.id}
              style={{ cursor: 'pointer', borderColor: activeAgent === a.id ? '#64ffda' : 'transparent' }}
              color={activeAgent === a.id ? '#1a73e8' : '#1a1a3a'}
              onClick={() => setActiveAgent(a.id)}
            >{a.name || a.code}</Tag>
          ))}
        </Space>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', background: '#0d0f2a' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16, display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8 }}>
            <Avatar
              icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              style={{ backgroundColor: msg.role === 'user' ? '#1a73e8' : '#64ffda', color: msg.role === 'user' ? '#fff' : '#0a0e27', flexShrink: 0 }}
            />
            <div style={{ maxWidth: '80%' }}>
              <div style={{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{msg.agent}</Text>
              </div>
              <div style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, #1a73e8, #1557b0)' : '#131a3a',
                color: '#e0e6f0',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                border: '1px solid rgba(255,255,255,0.06)',
                whiteSpace: 'pre-wrap',
                fontSize: 13,
                lineHeight: 1.6
              }}>
                {msg.content}
                {msg.data && (
                  <div style={{ marginTop: 8, padding: 8, background: 'rgba(100,255,218,0.08)', borderRadius: 6, fontSize: 12 }}>
                    <Text style={{ color: '#64ffda' }}>📊 {JSON.stringify(msg.data).substring(0, 100)}...</Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8 }}>
            <Spin size="small" />
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>小锋正在思考...</Text>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', background: '#131a3a', borderRadius: '0 0 12px 12px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Input.TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="向小锋提问：查询Agent状态、分配任务..."
          style={{
            background: '#0d0f2a', color: '#e0e6f0', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, fontSize: 13, resize: 'none',
            marginBottom: 8
          }}
          rows={2}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Shift+Enter 换行 · Enter 发送</Text>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            loading={loading}
            style={{ background: 'linear-gradient(135deg, #64ffda, #1a73e8)', border: 'none', borderRadius: 8 }}
          >发送</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', bottom: 90, right: 24, width: 420, height: 600,
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(100,255,218,0.1)',
      zIndex: 9999,
      display: minimized ? 'none' : 'block'
    }}>
      {chatContent}
    </div>
  );
};

export default SmarTOPChat;
