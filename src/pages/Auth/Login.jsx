import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, Form, Input, Button, Typography, message, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const { Title, Text } = Typography;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm();

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const onSubmit = async (data) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await axios.post('https://krishtalball.onrender.com/api/auth/login', data, {
        withCredentials: true,
      });
      const { user } = res.data;
      login(user);
      setSuccessMsg('Login successful!');
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Invalid email or password';
      setErrorMsg(msg);
      message.error(msg);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #1f1f1f, #333)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#fff',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0 }}>Military Asset Login</Title>
          <Text type="secondary">Enter your credentials to proceed</Text>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            style={{ marginBottom: '16px' }}
          />
        )}

        {successMsg && (
          <Alert
            message={successMsg}
            type="success"
            showIcon
            closable
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Email">
            <Controller
              name="email"
              control={control}
              rules={{ required: 'Email is required' }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Password">
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Password is required' }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Enter your password"
                />
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>

          {/* Register link */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text>Don't have an account? </Text>
            <a onClick={() => navigate('/register')} style={{ color: '#1890ff' }}>
              Register here
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
