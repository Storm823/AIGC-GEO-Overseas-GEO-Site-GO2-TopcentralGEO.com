import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Tree, Table, Avatar, Tag, Typography, Button, Input,
  Space, Spin, Empty, Modal, Form, Select, message, Badge
} from 'antd';
import {
  TeamOutlined, UserOutlined, PlusOutlined, SearchOutlined,
  MailOutlined, ReloadOutlined, ApartmentOutlined, CrownOutlined,
  SafetyCertificateOutlined, LockOutlined
} from '@ant-design/icons';
import { teamApi } from '../../api';

const { Text, Title } = Typography;

// Real departments from database
const DEPARTMENTS = [
  { id: '68f331da-a4c9-4d23-96fb-d7f1ef2b2510', name: 'Strategy Command', icon: <CrownOutlined /> },
  { id: '14b5913c-543e-4492-8e21-812f836686a9', name: 'Content R&D', icon: <TeamOutlined /> },
  { id: 'b9d1fd1c-042b-4cd8-b039-c03ccb3a208c', name: 'Technical Experts', icon: <TeamOutlined /> },
  { id: 'a106b037-2ef0-4d81-a292-2cc918e92f1f', name: 'DevOps & Automation', icon: <TeamOutlined /> },
  { id: '4eab5189-8802-435a-9c0a-228138f2ba31', name: 'Sales & Service', icon: <TeamOutlined /> },
  { id: '40ddbdfa-6d8f-4aa6-867a-3d2cf964f5aa', name: 'Interaction & Customer Service', icon: <TeamOutlined /> },
  { id: 'b37cf53a-7f2b-4e94-a00a-6443cabebe21', name: 'Token Cost Management', icon: <TeamOutlined /> },
];

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin', color: 'gold' },
  { value: 'admin', label: 'Admin', color: 'blue' },
  { value: 'developer', label: 'Developer', color: 'green' },
  { value: 'viewer', label: 'Viewer', color: 'default' },
];

export default function Team() {
  const [departments, setDepartments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch real departments and agents from API
      const [deptRes, agentRes] = await Promise.all([
        teamApi.getDepartments(),
        teamApi.getAgents(),
      ]);
      setDepartments(deptRes.data || DEPARTMENTS);
      setAgents(agentRes.data || []);
    } catch (err) {
      // Fallback to static data if API fails
      setDepartments(DEPARTMENTS);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((a) => {
    if (searchText) {
      return (
        a.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        a.code?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (selectedDept) {
      return a.department_id === selectedDept;
    }
    return true;
  });

  const columns = [
    {
      title: 'Agent',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={36} icon={<UserOutlined />} style={{ background: 'var(--primary)' }} />
          <div>
            <Text style={{ color: 'var(--text-white)', fontWeight: 600 }}>{text}</Text>
            <div><Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>{record.code}</Text></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role Type',
      dataIndex: 'role_type',
      key: 'role_type',
      width: 120,
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Layer',
      dataIndex: 'layer',
      key: 'layer',
      width: 120,
      render: (layer) => <Tag>{layer}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text style={{ color: 'var(--text-secondary)' }}>{text}</Text>,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Loading team data..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ color: 'var(--text-white)', margin: 0 }}>
            Team Management
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Manage team agents and organization structure — {agents.length} agents
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setInviteModalVisible(true)}>
            Invite Member
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Department List */}
        <Col xs={24} lg={6}>
          <Card bodyStyle={{ padding: '12px 0' }}>
            <div style={{ padding: '0 16px 12px', borderBottom: '1px solid var(--border-color)' }}>
              <Text style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
                Departments
              </Text>
            </div>
            <div style={{ padding: '8px 0' }}>
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDept(selectedDept === dept.id ? null : dept.id)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    background: selectedDept === dept.id ? 'rgba(26, 115, 232, 0.1)' : 'transparent',
                    borderLeft: selectedDept === dept.id ? '3px solid var(--primary)' : '3px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--text-primary)',
                  }}
                >
                  {dept.icon}
                  <span>{dept.name}</span>
                  <Badge
                    count={agents.filter((a) => a.department_id === dept.id).length}
                    style={{ marginLeft: 'auto', background: 'var(--primary)' }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Agents Table */}
        <Col xs={24} lg={18}>
          <Card bodyStyle={{ padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
              <Space>
                <Text style={{ color: 'var(--text-secondary)' }}>
                  {selectedDept
                    ? departments.find((d) => d.id === selectedDept)?.name
                    : 'All Agents'}
                </Text>
                <Badge count={filteredAgents.length} style={{ background: 'var(--primary)' }} overflowCount={999} />
              </Space>
              <Input
                prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
                placeholder="Search agents..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 240 }}
                allowClear
                size="small"
              />
            </div>
            <Table
              columns={columns}
              dataSource={filteredAgents}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: false }}
              locale={{ emptyText: <Empty description={<Text style={{ color: 'var(--text-muted)' }}>No agents found</Text>} /> }}
            />
          </Card>
        </Col>
      </Row>

      {/* Invite Modal */}
      <Modal
        title="Invite New Member"
        open={inviteModalVisible}
        onOk={() => setInviteModalVisible(false)}
        onCancel={() => { setInviteModalVisible(false); inviteForm.resetFields(); }}
        okText="Send Invite"
        cancelText="Cancel"
      >
        <Form form={inviteForm} layout="vertical">
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="member@company.com" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS} placeholder="Select role" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
