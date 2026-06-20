import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Avatar, Spin, Empty, message, Select, Typography } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ApiOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

// ========== Chat Debug API ==========
export const chatDebugApi = {
  getSessions: (agentId) => fetch(`/api/v1/agents/${agentId}/sessions`).then(r => r.json()),
  sendMessage: (sessionId, data) => fetch(`/api/v1/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  getMessages: (sessionId) => fetch(`/api/v1/chat/sessions/${sessionId}/messages`).then(r => r.json()),
  createSession: (agentId) => fetch(`/api/v1/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent_id: agentId }),
  }).then(r => r.json()),
};

// ========== Message Bubble ==========
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 10,
      marginBottom: 16,
      alignItems: 'flex-start',
    }}>
      <Avatar
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={{
          backgroundColor: isUser ? '#1a73e8' : '#64ffda',
          color: isUser ? '#fff' : '#0a0e27',
          flexShrink: 0,
        }}
      />
      <div style={{ maxWidth: '75%' }}>
        <div style={{ marginBottom: 4, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          {isUser ? '你' : message.agent_name || 'Agent'}
        </div>
        <div style={{
          background: isUser ? 'linear-gradient(135deg, #1a73e8, #1557b0)' : '#131a3a',
          color: '#e0e6f0',
          padding: '10px 14px',
          borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
          border: '1px solid rgba(255,255,255,0.06)',
          whiteSpace: 'pre-wrap',
          fontSize: 13,
          lineHeight: 1.6,
        }}>
          {message.content}
        </div>
      </div>
    </div>
  );
};

// ========== ChatWindow Component ==========
const ChatWindow = ({ agent, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const messagesEndRef = useRef(null);

  // Load sessions for the selected agent
  useEffect(() => {
    if (agent?.id) {
      fetchSessions();
    }
  }, [agent?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    if (!agent?.id) return;
    setLoading(true);
    try {
      const res = await chatDebugApi.getSessions(agent.id);
      const sessionList = res.data || res.sessions || res.items || [];
      setSessions(sessionList);
      if (sessionList.length > 0) {
        selectSession(sessionList[0]);
      }
    } catch (err) {
      // Fallback: create a demo session for testing
      setSessions([{ id: 'demo-session-1', agent_id: agent.id, created_at: new Date().toISOString() }]);
      setCurrentSession({ id: 'demo-session-1', agent_id: agent.id, created_at: new Date().toISOString() });
    }
    setLoading(false);
  };

  const selectSession = async (session) => {
    setCurrentSession(session);
    setLoading(true);
    setMessages([]);
    try {
      const res = await chatDebugApi.getMessages(session.id);
      setMessages(res.data || res.messages || res.items || []);
    } catch (err) {
      setMessages([]);
    }
    setLoading(false);
  };

  const createNewSession = async () => {
    if (!agent?.id) return;
    setCreatingSession(true);
    try {
      const res = await chatDebugApi.createSession(agent.id);
      const newSession = res.data || res.session || res;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (err) {
      message.error('创建会话失败');
    }
    setCreatingSession(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession || sending) return;
    const userContent = input.trim();
    setInput('');
    setSending(true);

    // Optimistically add user message
    const userMsg = { role: 'user', content: userContent, agent_name: '你' };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await chatDebugApi.sendMessage(currentSession.id, { content: userContent });
      if (res.data || res.message || res.messages) {
        const replyMsgs = res.data || res.messages || [res.message];
        setMessages(prev => [...prev, ...(Array.isArray(replyMsgs) ? replyMsgs : [replyMsgs])]);
      } else {
        setMessages(prev => [...prev, { role: 'agent', content: res.content || JSON.stringify(res), agent_name: agent.name }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', content: '发送失败: ' + err.message, agent_name: agent.name }]);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!agent) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)',
      }}>
        <Empty description="选择一个 Agent 开始调试" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Session Header */}
      <div style={{
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #1a73e8, #0d47a1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#64ffda', color: '#0a0e27' }} />
          <div>
            <Text strong style={{ color: '#fff', fontSize: 14 }}>{agent.name} · 调试面板</Text>
            <br />
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
              <ApiOutlined /> /api/v1/chat/sessions/{{sessionId}}/messages
            </Text>
          </div>
        </div>
        <Button
          type="text"
          onClick={onClose}
          style={{ color: 'rgba(255,255,255,0.7)' }}
          size="small"
        >
          关闭
        </Button>
      </div>

      {/* Session Selector */}
      <div style={{
        padding: '8px 12px',
        background: '#131a3a',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, flexShrink: 0 }}>会话:</Text>
        <Select
          value={currentSession?.id}
          onChange={(val) => {
            const sess = sessions.find(s => s.id === val);
            if (sess) selectSession(sess);
          }}
          style={{ flex: 1, minWidth: 120 }}
          size="small"
          options={sessions.map(s => ({
            value: s.id,
            label: `会话 ${s.id.substring(0, 8)}... (${new Date(s.created_at).toLocaleTimeString()})`,
          }))}
        />
        <Button
          size="small"
          type="dashed"
          onClick={createNewSession}
          loading={creatingSession}
          style={{ color: '#64ffda', borderColor: '#64ffda' }}
        >
          + 新会话
        </Button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        background: '#0d0f2a',
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin tip="加载消息..." />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Empty description="发送消息开始调试" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          messages.map((msg, idx) => <MessageBubble key={idx} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '12px 16px',
        background: '#131a3a',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`向 ${agent.name} 发送消息...`}
          style={{
            background: '#0d0f2a',
            color: '#e0e6f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            fontSize: 13,
            resize: 'none',
            marginBottom: 8,
          }}
          rows={2}
          disabled={!currentSession || sending}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
            Shift+Enter 换行 · Enter 发送
          </Text>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            loading={sending}
            disabled={!currentSession}
            style={{ background: 'linear-gradient(135deg, #64ffda, #1a73e8)', border: 'none', borderRadius: 8 }}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;