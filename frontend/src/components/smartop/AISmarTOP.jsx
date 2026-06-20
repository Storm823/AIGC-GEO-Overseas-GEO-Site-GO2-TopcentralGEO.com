import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Button, Typography, Avatar, Spin, Tooltip, message as antMessage } from 'antd';
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  MinusOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { smartopApi } from '../../api';

const { Text } = Typography;

const QUICK_ACTIONS = [
  { icon: <BulbOutlined />, label: '创建 Agent', prompt: '帮我创建一个新的 AI Agent' },
  { icon: <ThunderboltOutlined />, label: '分析 Token', prompt: '帮我分析最近的 Token 使用情况' },
  { icon: <QuestionCircleOutlined />, label: '帮助', prompt: 'AIGC GEO 平台有哪些主要功能？' },
];

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `👋 你好！我是 **AI SmarTOP 助手**，可以帮你：

- 🤖 创建和管理 Agent
- 📊 分析平台数据
- 🔧 配置工作流
- 💡 提供优化建议

有什么需要帮助的吗？`,
};

export default function AISmarTOP() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: window.innerHeight - 600 });
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await smartopApi.ask({
        message: input.trim(),
        history: messages.slice(-10),
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data?.reply || res.data?.message || '抱歉，我暂时无法回答这个问题。' },
      ]);
    } catch (err) {
      // Fallback: simulate response for demo
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `收到您的问题: "${userMsg.content}"\n\n这是一个很好的问题！在实际环境中，我会连接到 AI 后端来提供详细的回答。目前您可以探索平台的各个功能模块。`,
          },
        ]);
        setLoading(false);
      }, 800);
      return;
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMouseDown = (e, target) => {
    if (target === 'header') {
      setDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        setPosition({
          x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 360)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 500)),
        });
      }
    };
    const handleMouseUp = () => setDragging(false);
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, position]);

  // Floating button
  if (!isOpen) {
    return (
      <Tooltip title="AI SmarTOP 助手" placement="left">
        <div
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(26, 115, 232, 0.4)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            animation: 'pulse 2s ease-in-out infinite',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(26, 115, 232, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(26, 115, 232, 0.4)';
          }}
        >
          <MessageOutlined style={{ color: '#fff', fontSize: 24 }} />
        </div>
      </Tooltip>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        width: 360,
        height: isMinimized ? 48 : 520,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'height 0.3s ease',
        cursor: dragging ? 'grabbing' : 'default',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          cursor: 'grab',
          flexShrink: 0,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'header')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RobotOutlined style={{ color: '#fff', fontSize: 18 }} />
          <Text style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>AI SmarTOP</Text>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            type="text"
            icon={<MinusOutlined />}
            size="small"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            onClick={() => setIsMinimized(!isMinimized)}
          />
          <Button
            type="text"
            icon={<CloseOutlined />}
            size="small"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            onClick={() => { setIsOpen(false); setIsMinimized(false); }}
          />
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 16,
              background: 'var(--bg-main)',
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.role}`}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <RobotOutlined style={{ color: '#fff', fontSize: 14 }} />
                  </div>
                )}
                <div className={`chat-bubble ${msg.role}`}>
                  <Text style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
                    {msg.content}
                  </Text>
                </div>
                {msg.role === 'user' && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <UserOutlined style={{ color: '#fff', fontSize: 14 }} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <RobotOutlined style={{ color: '#fff', fontSize: 14 }} />
                </div>
                <div className="chat-bubble assistant">
                  <Spin size="small" />
                  <Text style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 13 }}>
                    思考中...
                  </Text>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div
              style={{
                padding: '8px 12px',
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
              }}
            >
              {QUICK_ACTIONS.map((action, idx) => (
                <Button
                  key={idx}
                  size="small"
                  icon={action.icon}
                  style={{
                    fontSize: 11,
                    height: 28,
                    borderRadius: 14,
                    background: 'rgba(26, 115, 232, 0.08)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '8px 12px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
            }}
          >
            <Input.TextArea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: 13,
                resize: 'none',
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              style={{
                height: 36,
                width: 36,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
