import { Layout, Menu, Dropdown, Button } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
  DeploymentUnitOutlined,
  UserSwitchOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const { Sider, Content, Header } = Layout;

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

const handleLogout = async () => {
  await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
  logout();
  navigate('/');
};

  const profileMenu = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />} disabled>
        {user?.name}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: 'white', padding: '20px', fontWeight: 'bold', fontSize: '18px' }}>
          🛡️ MAMS
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}>
          <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/purchase" icon={<ShoppingCartOutlined />}>
            <Link to="/purchase">Purchase</Link>
          </Menu.Item>
          <Menu.Item key="/transfer" icon={<DeploymentUnitOutlined />}>
            <Link to="/transfer">Transfer</Link>
          </Menu.Item>
          <Menu.Item key="/assignment" icon={<UserSwitchOutlined />}>
            <Link to="/assignment">Assignment</Link>
          </Menu.Item>
          <Menu.Item key="/expenditure" icon={<ThunderboltOutlined />}>
            <Link to="/expenditure">Expenditure</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 64,
          }}
        >
          <h3 style={{ margin: 0 }}>Welcome to MAMS</h3>
          <Dropdown overlay={profileMenu} placement="bottomRight">
            <Button icon={<UserOutlined />}>{user?.name}</Button>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: '0 16px',
            padding: 24,
            background: '#fff',
            overflowY: 'auto',
            height: 'calc(100vh - 64px)',
            minHeight: 0,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
