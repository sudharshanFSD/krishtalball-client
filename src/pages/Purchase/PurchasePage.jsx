import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Input,
  Select,
  Button,
  DatePicker,
  Table,
  Form,
  Row,
  Col,
  Space,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const { RangePicker } = DatePicker;

const PurchasePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ type: '', dates: [] });
  const [showHistory, setShowHistory] = useState(false); 

  if (!user) return null;

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      quantity: '',
      type: '',
      base: user?.role === 'commander' ? user.base : '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (user.role === 'commander') {
        data.base = user.base;
      }
      const res = await axios.post('https://krishtalball.onrender.com/api/asset/purchase', data, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      message.success('✅ Asset purchased successfully!');
      reset();
      queryClient.invalidateQueries(['purchases']);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Purchase failed.';
      message.error('error ' + errorMessage);
    },
  });

  const onSubmit = (values) => {
    values.quantity = parseInt(values.quantity);
    if (user?.role === 'commander') {
      values.base = user.base;
    }
    mutation.mutate(values);
  };

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['purchases', filters],
    queryFn: async () => {
      const { type, dates } = filters;
      const params = {};
      if (type) params.type = type;
      if (dates.length === 2) {
        params.startDate = dayjs(dates[0]).toISOString();
        params.endDate = dayjs(dates[1]).toISOString();
      }
      const res = await axios.get('https://krishtalball.onrender.com/api/asset/purchase', {
        params,
        withCredentials: true,
      });
      return res.data;
    },
  });

  useEffect(() => {
    if (!isLoading && Array.isArray(purchases) && purchases.length === 0 && showHistory) {
      message.info('ℹ️ No purchases found for selected filters.');
    }
  }, [purchases, isLoading, showHistory]);

  const handleFilterChange = (changed) => {
    setFilters((prev) => ({ ...prev, ...changed }));
  };

  return (
    <div className="p-6 space-y-6">
      {(user.role === 'admin' || user.role === 'commander') && (
        <Card title="🛒 Add New Purchase" bordered className="shadow-md" style={{ borderRadius: 12 }}>
          <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Form.Item label="Asset Name" required>
                      <Input {...field} placeholder="e.g. AK-47" />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Form.Item label="Quantity" required>
                      <Input type="number" min={1} {...field} placeholder="Enter quantity" />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Form.Item label="Asset Type" required>
                      <Select {...field} placeholder="Select asset type">
                        <Select.Option value="weapon">weapon</Select.Option>
                        <Select.Option value="vehicle">vehicle</Select.Option>
                        <Select.Option value="ammo">ammo</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Controller
                  name="base"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Form.Item label="Base" required>
                      <Input
                        {...field}
                        placeholder={user.role === 'admin' ? 'Enter base name' : user.base}
                        disabled={user.role === 'commander'}
                      />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col span={24}>
                <Button type="primary" htmlType="submit" loading={mutation.isPending}>
                  Add Purchase
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {/* Toggle Button for Purchase History */}
      <Button
        type="default"
        onClick={() => setShowHistory(!showHistory)}
        style={{ marginTop: 8 }}
      >
        {showHistory ? 'Hide History' : 'Show History'}
      </Button>

      {showHistory && (
        <Card
          title="📜 Purchase History"
          bordered
          className="shadow-md"
          style={{ borderRadius: 12, marginTop: 12 }}
          extra={
            <Space>
              <Select
                placeholder="Filter by Type"
                allowClear
                style={{ width: 160 }}
                onChange={(val) => handleFilterChange({ type: val })}
              >
                <Select.Option value="weapon">weapon</Select.Option>
                <Select.Option value="vehicle">vehicle</Select.Option>
                <Select.Option value="ammo">ammo</Select.Option>
              </Select>
              <RangePicker
                onChange={(dates) => handleFilterChange({ dates })}
                style={{ width: 250 }}
              />
            </Space>
          }
        >
          <Table
            loading={isLoading}
            dataSource={Array.isArray(purchases) ? purchases : []}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            columns={[
              { title: 'Name', dataIndex: 'name' },
              { title: 'Type', dataIndex: 'type' },
              { title: 'Quantity', dataIndex: 'quantity' },
              { title: 'Base', dataIndex: 'base' },
              {
                title: 'Date',
                dataIndex: 'createdAt',
                render: (text) => dayjs(text).format('DD MMM YYYY'),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
};

export default PurchasePage;
