import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Layout, Typography, Menu, Button, Grid, Drawer } from 'antd';
import { 
  HomeOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  MenuOutlined 
} from '@ant-design/icons';
import { signOut } from 'firebase/auth';
import { auth } from '../database/firebaseConfig';

const { Header, Footer, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const AppLayout = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = screens.md;
  const { userId } = useParams();

  // Get current path without userId
  const pathSegments = location.pathname.split('/');
  const currentPath = pathSegments[1]?.toLowerCase() || 'home';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear all history and prevent back navigation
      window.history.replaceState(null, '', '/');
      window.location.replace('/'); // Hard redirect instead of navigation
      
      // Add additional security for modern browsers
      window.addEventListener('popstate', function preventBack(e) {
        window.history.pushState(null, '', '/');
        window.location.replace('/');
      });
      
      window.history.pushState(null, '', '/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to={`/home/${userId}`}>Home</Link>,
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to={`/profile/${userId}`}>Profile</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header style={{ 
        background: '#001529',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            QR Save
          </Title>

          {isDesktop ? (
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[currentPath]}
              items={menuItems}
              style={{ 
                flex: 1, 
                justifyContent: 'flex-end', 
                minWidth: 0 
              }}
            />
          ) : (
            <>
              <Button
                type="text"
                icon={<MenuOutlined style={{ color: 'white' }} />}
                onClick={() => setDrawerVisible(true)}
              />
              <Drawer
                title="Menu"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
              >
                <Menu
                  mode="vertical"
                  selectedKeys={[currentPath]}
                  items={menuItems}
                  style={{ borderRight: 0 }}
                />
              </Drawer>
            </>
          )}
        </div>
      </Header>

      {/* Main Content */}
      <Content style={{ 
        flex: 1,
        padding: '24px',
        background: '#f0f2f5'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ 
        background: '#001529',
        color: 'rgba(255, 255, 255, 0.65)',
        textAlign: 'center',
        padding: '24px 50px'
      }}>
        <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          © {new Date().getFullYear()} QR Save. All rights reserved.
        </Text>
      </Footer>
    </Layout>
  );
};

export default AppLayout;