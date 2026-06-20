import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { tasksApi } from '../../api';
import KanbanBoard from '../../components/common/KanbanBoard';

const { Text, Title } = Typography;

const MOCK_TASKS_DATA = {
  backlog: [
    { id: 't1', title: '优化内容生成流程', description: '改进内容生成 Agent 的 prompt 模板', status: 'backlog', priority: 'medium', tags: ['优化', '内容'], assignee: '张明', dueDate: '05/28' },
    { id: 't2', title: '集成 DeepSeek 模型', description: '在平台中接入 DeepSeek Chat API', status: 'backlog', priority: 'high', tags: ['集成', 'AI模型'], assignee: '李华', dueDate: '06/01' },
    { id: 't3', title: '多语言支持扩展', description: '增加对日语、韩语的内容生成支持', status: 'backlog', priority: 'low', tags: ['国际化'], dueDate: '06/15' },
  ],
  todo: [
    { id: 't4', title: 'Token 用量预警功能', description: '实现 Token 用量超过阈值时自动告警', status: 'todo', priority: 'high', tags: ['功能', '监控'], assignee: '王芳', dueDate: '05/25' },
    { id: 't5', title: '数据导出 CSV 格式', description: '支持任务结果导出为 CSV 文件', status: 'todo', priority: 'medium', tags: ['导出'], assignee: '赵雷', dueDate: '05/26' },
  ],
  'in-progress': [
    { id: 't6', title: 'Agent 测试框架开发', description: '为 Agent 开发自动化测试功能', status: 'in-progress', priority: 'urgent', tags: ['开发', '测试'], assignee: '张明', dueDate: '05/23' },
    { id: 't7', title: '实时日志查看器', description: 'Agent 执行日志的实时流式查看', status: 'in-progress', priority: 'high', tags: ['功能', '日志'], assignee: '李华', dueDate: '05/24' },
  ],
  review: [
    { id: 't8', title: 'UI 主题定制功能', description: '支持用户自定义界面主题配色', status: 'review', priority: 'medium', tags: ['UI', '功能'], assignee: '陈静', dueDate: '05/22' },
  ],
  done: [
    { id: 't9', title: '固定侧边栏布局', description: '侧边栏改为固定模式，页面滚动时保持可见', status: 'done', priority: 'medium', tags: ['UI'], assignee: '赵雷', dueDate: '05/20' },
    { id: 't10', title: 'API 认证机制', description: '实现 JWT 认证和 API Key 管理', status: 'done', priority: 'urgent', tags: ['安全'], assignee: '王芳', dueDate: '05/18' },
  ],
};

export default function Tasks() {
  const [tasks, setTasks] = useState(MOCK_TASKS_DATA);
  const [loading, setLoading] = useState(true);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskForm] = Form.useForm();
  const [editingTask, setEditingTask] = useState(null);
  const [currentColumn, setCurrentColumn] = useState('backlog');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await tasksApi.list();
      if (res.data) {
        groupTasks(res.data);
      } else {
        setTasks(MOCK_TASKS_DATA);
      }
    } catch (err) {
      setTasks(MOCK_TASKS_DATA);
    } finally {
      setLoading(false);
    }
  };

  const groupTasks = (tasksList) => {
    const grouped = { backlog: [], todo: [], 'in-progress': [], review: [], done: [] };
    tasksList.forEach((task) => {
      const col = task.status || 'backlog';
      if (grouped[col]) grouped[col].push(task);
      else grouped.backlog.push(task);
    });
    setTasks(grouped);
  };

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      await tasksApi.moveCard(taskId, newStatus);
      // Move in local state
      const newTasks = { ...tasks };
      let movedTask = null;
      Object.keys(newTasks).forEach((colId) => {
        const idx = newTasks[colId].findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          movedTask = { ...newTasks[colId][idx], status: newStatus };
          newTasks[colId].splice(idx, 1);
        }
      });
      if (movedTask && newTasks[newStatus]) {
        newTasks[newStatus].push(movedTask);
      }
      setTasks(newTasks);
    } catch (err) {
      message.error('移动失败');
    }
  };

  const handleOpenAddTask = (columnId) => {
    setCurrentColumn(columnId || 'backlog');
    setEditingTask(null);
    taskForm.resetFields();
    taskForm.setFieldsValue({ status: columnId || 'backlog' });
    setTaskModalVisible(true);
  };

  const handleSaveTask = async () => {
    try {
      const values = await taskForm.validateFields();
      if (editingTask) {
        await tasksApi.update(editingTask.id, values);
        message.success('任务已更新');
      } else {
        await tasksApi.create(values);
        message.success('任务已创建');
      }
      setTaskModalVisible(false);
      taskForm.resetFields();
      fetchTasks();
    } catch (err) {
      if (err.message) message.error('保存失败');
    }
  };

  // Flatten all tasks for KanbanBoard
  const allTasks = Object.values(tasks).flat();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="加载看板数据..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
            任务看板
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            拖拽管理任务状态，共 {allTasks.length} 个任务
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchTasks}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenAddTask('backlog')}>
            新建任务
          </Button>
        </Space>
      </div>

      {/* Kanban Board */}
      <KanbanBoard tasks={tasks} onMove={handleMoveTask} onAddTask={handleOpenAddTask} />

      {/* Task Create/Edit Modal */}
      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={taskModalVisible}
        onOk={handleSaveTask}
        onCancel={() => { setTaskModalVisible(false); taskForm.resetFields(); }}
        okText={editingTask ? '保存' : '创建'}
        cancelText="取消"
      >
        <Form form={taskForm} layout="vertical">
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="输入任务标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="描述任务详情" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { value: 'backlog', label: '待办列表' },
                { value: 'todo', label: '待处理' },
                { value: 'in-progress', label: '进行中' },
                { value: 'review', label: '审核中' },
                { value: 'done', label: '已完成' },
              ]}
            />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select
              options={[
                { value: 'urgent', label: '紧急' },
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' },
              ]}
            />
          </Form.Item>
          <Form.Item name="assignee" label="负责人">
            <Input placeholder="输入负责人姓名" />
          </Form.Item>
          <Form.Item name="dueDate" label="截止日期">
            <Input placeholder="例如: 05/28" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
