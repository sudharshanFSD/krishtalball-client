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
  Result,
  Alert,
} from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const AssignmentPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState('');
  const [filters, setFilters] = useState({ type: '', dates: [] });
  const [showHistory, setShowHistory] = useState(false); // 👈 Show/Hide toggle

  const { control, handleSubmit, reset } = useForm();

  const { data: filterOptions = {}, isLoading: loadingFilters } = useQuery({
    queryKey: ['assetFilters'],
    queryFn: async () => {
      const res = await axios.get('https://krishtalball.onrender.com/api/asset/filters', {
        withCredentials: true,
      });
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        name: data.name,
        type: data.type,
        quantity: parseInt(data.quantity, 10),
        assignedTo: data.assignedTo,
        base: data.base || user.base,
      };

      const res = await axios.post('https://krishtalball.onrender.com/api/assets/assign', payload, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      setFormError('');
      message.success('✅ Asset assigned');
      reset();
      queryClient.invalidateQueries(['assignments']);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || 'Assignment failed.';
      message.error('❌ ' + msg);
      setFormError(msg);
      console.error('Assignment error:', error);
    },
  });

  const { data: rawAssignments, isLoading } = useQuery({
    queryKey: ['assignments', filters],
    queryFn: async () => {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.dates.length === 2) {
        params.startDate = dayjs(filters.dates[0]).toISOString();
        params.endDate = dayjs(filters.dates[1]).toISOString();
      }
      const res = await axios.get('https://krishtalball.onrender.com/api/assets/assign', {
        params,
        withCredentials: true,
      });
      return res.data;
    },
  });

  const assignments = Array.isArray(rawAssignments) ? rawAssignments : [];

  const handleFilterChange = (changed) => {
    setFilters((prev) => ({ ...prev, ...changed }));
  };

  if (user.role === 'logistics') {
    return (
      <Result
        status="403"
        title="403 Forbidden"
        subTitle="You do not have permission to assign assets."
      />
    );
  }

  return (
    <div className="p-6 space-y-6" style={{ overflowX: 'hidden' }}>
      {(user.role === 'admin' || user.role === 'commander') && (
        <Card title="📋 Assign Asset" bordered={false} style={{ borderRadius: 12 }}>
          <Form layout="vertical" onFinish={handleSubmit(mutation.mutate)}>
            {formError && (
              <Alert
                message={formError}
                type="error"
                showIcon
                closable
                style={{ marginBottom: 16 }}
                onClose={() => setFormError('')}
              />
            )}

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12} md={8}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Type is required' }}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="Asset Type *"
                      validateStatus={fieldState.error ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Select
                        {...field}
                        placeholder="Select type"
                        size="middle"
                        loading={loadingFilters}
                        options={filterOptions.types?.map((t) => ({ label: t, value: t }))}
                      />
                    </Form.Item>
                  )}
                />
              </Col>

              {user.role === 'admin' && (
                <Col xs={24} sm={12} md={8}>
                  <Controller
                    name="base"
                    control={control}
                    rules={{ required: 'Base is required' }}
                    render={({ field, fieldState }) => (
                      <Form.Item
                        label="Base *"
                        validateStatus={fieldState.error ? 'error' : ''}
                        help={fieldState.error?.message}
                      >
                        <Select
                          {...field}
                          placeholder="Select base"
                          size="middle"
                          loading={loadingFilters}
                          options={filterOptions.bases?.map((b) => ({ label: b, value: b }))}
                        />
                      </Form.Item>
                    )}
                  />
                </Col>
              )}

              <Col xs={24} sm={12} md={8}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Asset name is required' }}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="Asset Name *"
                      validateStatus={fieldState.error ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Input {...field} placeholder="E.g. AK-47" size="middle" />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ required: 'Quantity is required' }}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="Quantity *"
                      validateStatus={fieldState.error ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Input type="number" min={1} {...field} placeholder="Enter quantity" size="middle" />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Controller
                  name="assignedTo"
                  control={control}
                  rules={{ required: 'Assignment target is required' }}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="Assigned To (Unit/Person) *"
                      validateStatus={fieldState.error ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Input {...field} placeholder="E.g. Alpha Team" size="middle" />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="middle" loading={mutation.isLoading}>
                    Assign Asset
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {/* Toggle History Button */}
      <Button
        type="default"
        onClick={() => setShowHistory(!showHistory)}
        style={{ marginTop: 8 }}
      >
        {showHistory ? 'Hide History' : 'Show History'}
      </Button>

      {/* Assignment History Table */}
      {showHistory && (
        <Card title="📦 Assignment History" bordered={false} style={{ borderRadius: 12, marginTop: 12 }}>
          <Space style={{ marginBottom: 16 }}>
            <Select
              placeholder="Filter by Type"
              allowClear
              style={{ width: 200 }}
              onChange={(val) => handleFilterChange({ type: val })}
              loading={loadingFilters}
              options={filterOptions.types?.map((t) => ({ label: t, value: t }))}
              size="middle"
            />
            <RangePicker
              onChange={(dates) => handleFilterChange({ dates })}
              style={{ width: 280 }}
              size="middle"
            />
          </Space>

          <Table
            size="small"
            loading={isLoading}
            dataSource={assignments}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            columns={[
              { title: 'Name', dataIndex: 'assetName' },
              { title: 'Type', dataIndex: 'assetType' },
              { title: 'Quantity', dataIndex: 'quantity' },
              { title: 'Assigned To', dataIndex: 'assignedTo' },
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

export default AssignmentPage;
