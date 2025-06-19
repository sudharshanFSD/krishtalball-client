import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Alert,
  Select,
} from "antd";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm();
  const [errorMsg, setErrorMsg] = useState(null);

  const onSubmit = async (data) => {
    setErrorMsg(null);
    try {
      const res = await axios.post("https://krishtalball.onrender.com/api/auth/register", data, {
        withCredentials: true,
      });
      const { user } = res.data;
      login(user); 
      message.success("Registration successful!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed";
      setErrorMsg(msg);
      message.error(msg);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #1f1f1f, #333)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "32px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#fff",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title level={3} style={{ margin: 0 }}>
            Create Your Account
          </Title>
          <Text type="secondary">Register to manage military assets</Text>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            style={{ marginBottom: "16px" }}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Name">
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <Input placeholder="Your name" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item label="Email">
            <Controller
              name="email"
              control={control}
              rules={{ required: "Email is required" }}
              render={({ field }) => (
                <Input type="email" placeholder="Email address" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item label="Password">
            <Controller
              name="password"
              control={control}
              rules={{ required: "Password is required" }}
              render={({ field }) => (
                <Input.Password placeholder="Password" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item label="Role">
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select placeholder="Select role" {...field}>
                  <Option value="admin">admin</Option>
                  <Option value="commander">commander</Option>
                  <Option value="logistics">logistics</Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Base">
            <Controller
              name="base"
              control={control}
              rules={{ required: "Base is required" }}
              render={({ field }) => (
                <Input placeholder="Base name or ID" {...field} />
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Register
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Text>
              Already have an account?{" "}
              <a onClick={() => navigate("/")}>Login</a>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
