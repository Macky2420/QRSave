import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Spin, message, Grid, Row, Col, Avatar, Button, Modal, Form, Input } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { ref, onValue } from 'firebase/database';
import { auth, db } from '../database/firebaseConfig';
import { onAuthStateChanged, updatePassword, signOut } from 'firebase/auth';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Profile = () => {
    const screens = useBreakpoint();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userId: paramId } = useParams();
    const [userId, setUserId] = useState(paramId || null);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [form] = Form.useForm();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(prev => prev || user.uid);
        setIsCurrentUser(paramId ? user.uid === paramId : true);
      } else {
        message.error('User not authenticated');
      }
    });
    return unsubscribeAuth;
  }, [paramId]);

  useEffect(() => {
    if (!userId) return;
    
    const userRef = ref(db, `accounts/${userId}`);
    const off = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData({
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '—'
        });
      } else {
        message.error('No user data found');
      }
      setLoading(false);
    }, (error) => {
      message.error(`Error fetching profile: ${error.message}`);
      setLoading(false);
    });
    
    return () => off();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 32 
      }}>
        <Text type="secondary">User profile not found</Text>
      </div>
    );
  }

  const handlePasswordChange = async (values) => {
    try {
      const user = auth.currentUser;
      await updatePassword(user, values.newPassword);
      message.success('Password updated successfully!');
      setChangePasswordVisible(false);
      
      // Sign out and redirect
      await signOut(auth);
      window.location.href = '/';  // Full page reload to clear state
      
      // Prevent back navigation
      window.history.replaceState(null, '', '/');
    } catch (error) {
      message.error(`Error updating password: ${error.message}`);
    } finally {
      form.resetFields();
    }
  };

  const passwordModal = () => (
    <Modal
      title="Change Password"
      open={changePasswordVisible}
      onCancel={() => setChangePasswordVisible(false)}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handlePasswordChange}
        autoComplete="off"
      >
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please input new password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );


  return (
    <div style={{ 
      maxWidth: 800, 
      margin: '0 auto', 
      padding: screens.xs ? '16px 8px' : 32 
    }}>
      {/* Profile Header */}
      <Card
        variant="borderless"
        style={{ 
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: 24
        }}
      >
        <div style={{ 
          position: 'relative',
          marginBottom: screens.xs ? 64 : 80
        }}>
          {/* Cover Photo */}
          <div style={{
            height: screens.xs ? 120 : 160,
            background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
            borderRadius: 12,
            margin: '-16px -16px 16px -16px'
          }} />
          
          {/* Avatar */}
          <div style={{
            position: 'absolute',
            bottom: screens.xs ? -48 : -64,
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            <Avatar
              size={screens.xs ? 96 : 128}
              icon={<UserOutlined />}
              style={{ 
                border: '3px solid #fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
          </div>
        </div>

        {/* Profile Info */}
        <div style={{ textAlign: 'center', marginTop: screens.xs ? 56 : 72 }}>
          <Title level={screens.xs ? 4 : 2} style={{ marginBottom: 8 }}>
            {userData.name || 'Anonymous User'}
          </Title>
        </div>

        {/* Details Grid */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card 
              variant="borderless" 
              styles={{ body: { padding: '16px 24px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MailOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <div>
                  <Text type="secondary">Email</Text>
                  <Text strong style={{ display: 'block' }}>{userData.email || '—'}</Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card 
              variant="borderless" 
              styles={{ body: { padding: '16px 24px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CalendarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <div>
                  <Text type="secondary">Joined</Text>
                  <Text strong style={{ display: 'block' }}>{userData.createdAt}</Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Card 
              variant="borderless" 
              styles={{ body: { padding: '16px 24px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <div>
                  <Text type="secondary">Role</Text>
                  <Text strong style={{ display: 'block' }}>{userData.role || 'Standard User'}</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Additional Sections */}
      {isCurrentUser && (
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card
              title="Account Security"
              variant="borderless"
              style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Button 
                  type="default" 
                  onClick={() => setChangePasswordVisible(true)}
                >
                  Change Password
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      )}
      
      {passwordModal()}
    </div>
  );
};

export default Profile;