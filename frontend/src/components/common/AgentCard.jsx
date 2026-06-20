import React from 'react';
import { Card, Tag, Space, Typography, Button, Progress, Tooltip } from 'antd';
import {
  RobotOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const statusConfig = {
  online: { color: 'var(--success)', label: '运行中', tagColor: 'success' },
  offline: { color: 'var(--text-muted)', label: '已停止', tagColor: 'default' },
  error: { color: 'var(--error)', label: '异常', tagColor: 'error' },
  busy: { color: 'var(--warning)', label: '繁忙', tagColor: 'warning' },
};

export default function AgentCard({ agent, onDelete, onDuplicate, onToggle }) {
  const navigate = useNavigate();
  const status = statusConfig[agent?.status] || statusConfig.offline;

  return (
    <Card
      hoverable
      className="fade-in"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      bodyStyle={{ padding: 20 }}
      onClick={() => navigate(`/agents/${agent?.id}`)}
    >
      {/* Status indicator line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: status.color,
          boxShadow: `0 0 8px ${status.color}40`,
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <Space>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <RobotOutlined />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: 'var(--text-white)', fontSize: 15 }}>
              {agent?.name || '未命名 Agent'}
            </Title>
            <Tag color={status.tagColor} style={{ marginTop: 4, fontSize: 11 }}>
              {status.label}
            </Tag>
          </div>
        </Space>
      </div>

      {/* Description */}
      <Text
        style={{
          color: 'var(--text-secondary)',
          fontSize: 13,
          display: 'block',
          marginBottom: 16,
          lineHeight: 1.5,
          minHeight: 40,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {agent?.description || '暂无描述'}
      </Text>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px 0',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 12,
        }}
      >
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-white)' }}>
            {agent?.taskCount ?? 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>任务数</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-white)' }}>
            {agent?.successRate ?? 0}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>成功率</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-white)' }}>
            {agent?.tokenUsage ?? 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Token</div>
        </div>
      </div>

      {/* Model Info */}
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Tag style={{ background: 'rgba(26, 115, 232, 0.15)', color: 'var(--primary)', border: 'none' }}>
          {agent?.model || 'gpt-4'}
        </Tag>
        <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          更新于 {agent?.updatedAt || '-'}
        </Text>
      </Space>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
        <Tooltip title="运行测试">
          <Button
            type="text"
            icon={<PlayCircleOutlined />}
            size="small"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => onToggle?.(agent?.id)}
          />
        </Tooltip>
        <Tooltip title="编辑">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => navigate(`/agents/${agent?.id}`)}
          />
        </Tooltip>
        <Tooltip title="复制">
          <Button
            type="text"
            icon={<CopyOutlined />}
            size="small"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => onDuplicate?.(agent?.id)}
          />
        </Tooltip>
        <Tooltip title="删除">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            style={{ color: 'var(--error)' }}
            onClick={() => onDelete?.(agent?.id)}
          />
        </Tooltip>
      </div>
    </Card>
  );
}
