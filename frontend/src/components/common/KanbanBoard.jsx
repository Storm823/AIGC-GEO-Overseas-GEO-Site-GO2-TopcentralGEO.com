import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Typography, Tag, Dropdown, Button, Spin, Empty, message } from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  DragOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import { tasksApi } from '../../api';

const { Text, Title } = Typography;

const columnColors = {
  backlog: { bg: 'rgba(90, 109, 138, 0.08)', header: '#5a6d8a', dot: '#5a6d8a' },
  todo: { bg: 'rgba(26, 115, 232, 0.06)', header: '#1a73e8', dot: '#1a73e8' },
  'in-progress': { bg: 'rgba(255, 214, 0, 0.06)', header: '#ffd600', dot: '#ffd600' },
  review: { bg: 'rgba(100, 255, 218, 0.06)', header: '#64ffda', dot: '#64ffda' },
  done: { bg: 'rgba(0, 200, 83, 0.06)', header: '#00c853', dot: '#00c853' },
};

const priorityConfig = {
  urgent: { color: 'var(--error)', label: '紧急' },
  high: { color: 'var(--warning)', label: '高' },
  medium: { color: 'var(--primary)', label: '中' },
  low: { color: 'var(--text-muted)', label: '低' },
};

function KanbanCard({ task, onMove }) {
  const [dragging, setDragging] = useState(false);
  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    setDragging(true);
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="kanban-card"
      style={{
        opacity: dragging ? 0.5 : 1,
        transform: dragging ? 'scale(0.95)' : 'scale(1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={{ color: 'var(--text-white)', fontSize: 14, fontWeight: 600, flex: 1 }}>
          {task.title}
        </Text>
        <Dropdown
          menu={{
            items: [
              { key: 'backlog', label: '移至 待办列表', onClick: () => onMove(task.id, 'backlog') },
              { key: 'todo', label: '移至 待处理', onClick: () => onMove(task.id, 'todo') },
              { key: 'in-progress', label: '移至 进行中', onClick: () => onMove(task.id, 'in-progress') },
              { key: 'review', label: '移至 审核中', onClick: () => onMove(task.id, 'review') },
              { key: 'done', label: '移至 已完成', onClick: () => onMove(task.id, 'done') },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} size="small" style={{ color: 'var(--text-muted)' }} />
        </Dropdown>
      </div>

      {task.description && (
        <Text
          style={{
            color: 'var(--text-secondary)',
            fontSize: 12,
            display: 'block',
            marginBottom: 12,
            lineHeight: 1.4,
          }}
          ellipsis={{ rows: 2 }}
        >
          {task.description}
        </Text>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {task.tags?.map((tag) => (
          <Tag key={tag} style={{ fontSize: 10, lineHeight: '18px', padding: '0 6px' }}>
            {tag}
          </Tag>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag
            style={{
              fontSize: 10,
              lineHeight: '18px',
              padding: '0 6px',
              borderColor: priority.color,
              color: priority.color,
              background: `${priority.color}10`,
            }}
          >
            {priority.label}
          </Tag>
          {task.dueDate && (
            <Text style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              <ClockCircleOutlined style={{ marginRight: 2 }} />
              {task.dueDate}
            </Text>
          )}
        </div>
        {task.assignee && (
          <Tooltip title={task.assignee}>
            <Avatar
              size={24}
              icon={<UserOutlined />}
              style={{ background: 'var(--primary)', cursor: 'pointer' }}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// Need Avatar + Tooltip
import { Avatar, Tooltip } from 'antd';

function KanbanColumn({ column, tasks, onMove, onAdd }) {
  const [dragOver, setDragOver] = useState(false);
  const colors = columnColors[column.id] || columnColors.backlog;

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMove(taskId, column.id);
    }
  };

  return (
    <div
      className="kanban-column"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: dragOver ? 'rgba(26, 115, 232, 0.08)' : 'rgba(19, 26, 58, 0.5)',
        transition: 'all 0.2s',
        border: dragOver ? '2px dashed var(--primary)' : '2px dashed transparent',
        minWidth: 260,
        flex: 1,
      }}
    >
      <div className="kanban-column-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: colors.dot,
            }}
          />
          <span>{column.title}</span>
          <span
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 10,
              padding: '0 8px',
              fontSize: 12,
              color: 'var(--text-muted)',
            }}
          >
            {tasks.length}
          </span>
        </div>
        <Button
          type="text"
          icon={<PlusOutlined />}
          size="small"
          style={{ color: 'var(--text-muted)' }}
          onClick={() => onAdd(column.id)}
        />
      </div>

      <div style={{ minHeight: 60 }}>
        {tasks.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>暂无任务</Text>}
            style={{ margin: '20px 0' }}
          />
        ) : (
          tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onMove={onMove} />
          ))
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ projectId, onTaskClick }) {
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [columnsRes, tasksRes] = await Promise.all([
        tasksApi.getColumns(),
        tasksApi.list({ project_id: projectId }),
      ]);
      setColumns(columnsRes.data || DEFAULT_COLUMNS);
      groupTasksByColumn(tasksRes.data || []);
    } catch (err) {
      setError(err.message);
      setColumns(DEFAULT_COLUMNS);
    } finally {
      setLoading(false);
    }
  };

  const DEFAULT_COLUMNS = [
    { id: 'backlog', title: '待办列表' },
    { id: 'todo', title: '待处理' },
    { id: 'in-progress', title: '进行中' },
    { id: 'review', title: '审核中' },
    { id: 'done', title: '已完成' },
  ];

  const groupTasksByColumn = (tasksList) => {
    const grouped = {};
    columns.forEach((col) => { grouped[col.id] = []; });
    tasksList.forEach((task) => {
      const colId = task.status || 'backlog';
      if (grouped[colId]) {
        grouped[colId].push(task);
      } else {
        grouped['backlog'].push(task);
      }
    });
    setTasks(grouped);
  };

  const handleMove = async (taskId, newStatus) => {
    try {
      await tasksApi.moveCard(taskId, newStatus);
      // Optimistic update
      const newTasks = { ...tasks };
      let movedTask = null;
      Object.keys(newTasks).forEach((colId) => {
        const idx = newTasks[colId].findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          movedTask = { ...newTasks[colId][idx], status: newStatus };
          newTasks[colId].splice(idx, 1);
        }
      });
      if (movedTask) {
        if (!newTasks[newStatus]) newTasks[newStatus] = [];
        newTasks[newStatus].push(movedTask);
      }
      setTasks(newTasks);
      message.success('任务已移动');
    } catch (err) {
      message.error('移动失败: ' + err.message);
      loadData();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Empty
        description={<Text style={{ color: 'var(--error)' }}>加载失败: {error}</Text>}
        style={{ margin: '40px 0' }}
      >
        <Button type="primary" onClick={loadData}>
          重新加载
        </Button>
      </Empty>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 12,
      }}
    >
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={tasks[column.id] || []}
          onMove={handleMove}
          onAdd={(colId) => onTaskClick?.({ status: colId })}
        />
      ))}
    </div>
  );
}
