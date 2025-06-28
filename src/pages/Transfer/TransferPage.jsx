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
  message,
  Divider,
  Alert,
} from 'antd';

import dayjs from 'dayjs';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const { RangePicker } = DatePicker;

const TransferPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ type: '', dates: [] });
  const [formError, setFormError] = useState('');
  const [showHistory, setShowHistory] = useState(false); // Toggle state

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      quantity: '',
      type: '',
      fromBase: '',
      toBase: '',
    },
  });

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
      const res = await axios.post('https://krishtalball.onrender.com/api/assets/transfer', data, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      setFormError('');
      message.success('Transfer successful');
      reset();
      queryClient.invalidateQueries(['transfers']);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || 'Transfer failed.';
      setFormError(msg);
      message.error('Transfer failed: ' + msg);
    },
  });

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers', filters],
    queryFn: async () => {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.dates.length === 2) {
        params.startDate = dayjs(filters.dates[0]).toISOString();
        params.endDate = dayjs(filters.dates[1]).toISOString();
      }
      const res = await axios.get('https://krishtalball.onrender.com/api/assets/transfer', {
        params,
        withCredentials: true,
      });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const handleFilterChange = (changed) => {
    setFilters((prev) => ({ ...prev, ...changed }));
  };

  const onSubmit = (data) => {
    const formData = {
      ...data,
      quantity: parseInt(data.quantity),
      fromBase: user?.role === 'commander' ? user.base : data.fromBase,
    };

    if (!formData.name || !formData.quantity || !formData.type || !formData.toBase) {
      const errMsg = 'Please fill in all required fields';
      setFormError(errMsg);
      message.error(errMsg);
      return;
    }

    if (user?.role !== 'admin' && !formData.fromBase) {
      const errMsg = 'From base is required';
      setFormError(errMsg);
      message.error(errMsg);
      return;
    }

    mutation.mutate(formData);
  };

  const onError = () => {
    const errMsg = 'Please fix the form errors before submitting';
    setFormError(errMsg);
    message.error(errMsg);
  };

  return (
    <div className="p-6 space-y-6">
      {user?.role !== 'logistics' && (
        <Card title=" Transfer Assets" bordered={false} style={{ borderRadius: 12 }}>
          {formError && (
            <Alert
              message="Error"
              description={formError}
              type="error"
              showIcon
              closable
              onClose={() => setFormError('')}
              style={{ marginBottom: 16 }}
            />
          )}
          <Form layout="vertical" onFinish={handleSubmit(onSubmit, onError)}>
            <Row gutter={16}>
              <Col span={12}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Asset name is required' }}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="Asset Name"
                      validateStatus={fieldState.invalid ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Input {...field} placeholder="E.g. Bulletproof Vest" />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col span={12}>
                <Controller
                  name="quantity"
                  control={control}
                  rules={{
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Minimum quantity is 1' },
                    pattern: { value: /^\d+$/, message: 'Please enter a valid number' },
                  }}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="Quantity"
                      validateStatus={fieldState.invalid ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Input type="number" min={1} {...field} />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col span={12}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Asset type is required' }}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="Asset Type"
                      validateStatus={fieldState.invalid ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Select
                        {...field}
                        placeholder="Select type"
                        loading={loadingFilters}
                        options={filterOptions?.types?.map((t) => ({ label: t, value: t }))}
                      />
                    </Form.Item>
                  )}
                />
              </Col>

              {['admin', 'logistics'].includes(user?.role) && (
                <Col span={12}>
                  <Controller
                    name="fromBase"
                    control={control}
                    rules={{ required: 'From base is required' }}
                    render={({ field, fieldState }) => (
                      <Form.Item
                        label="From Base"
                        validateStatus={fieldState.invalid ? 'error' : ''}
                        help={fieldState.error?.message}
                      >
                        <Select
                          {...field}
                          placeholder="Select source base"
                          loading={loadingFilters}
                          options={filterOptions?.bases?.map((b) => ({ label: b, value: b }))}
                        />
                      </Form.Item>
                    )}
                  />
                </Col>
              )}

              <Col span={12}>
                <Controller
                  name="toBase"
                  control={control}
                  rules={{ required: 'To base is required' }}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="To Base"
                      validateStatus={fieldState.invalid ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Select
                        {...field}
                        placeholder="Select destination base"
                        loading={loadingFilters}
                        options={filterOptions?.bases?.map((b) => ({ label: b, value: b }))}
                      />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col span={24}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={mutation.isPending}
                    size="large"
                  >
                    Transfer Asset
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {/* Toggle Button */}
      <Button
        type="default"
        onClick={() => setShowHistory(!showHistory)}
        style={{ marginTop: 8 }}
      >
        {showHistory ? 'Hide History' : 'Show History'}
      </Button>

      {/* Transfer History Table */}
      {showHistory && (
        <Card title="Transfer History" bordered={false} style={{ borderRadius: 12, marginTop: 12 }}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col>
              <Select
                placeholder="Filter by Type"
                allowClear
                style={{ width: 160 }}
                onChange={(val) => handleFilterChange({ type: val })}
                loading={loadingFilters}
                options={filterOptions?.types?.map((t) => ({ label: t, value: t }))}
              />
            </Col>
            <Col>
              <RangePicker
                onChange={(dates) => handleFilterChange({ dates })}
                style={{ width: 250 }}
              />
            </Col>
          </Row>

          <Divider />

          <Table
            loading={isLoading}
            dataSource={transfers}
            rowKey="_id"
            pagination={{ pageSize: 5 }}

            columns={[
              { title: 'Name', dataIndex: 'assetName' },
              { title: 'Type', dataIndex: 'type' },
              { title: 'Quantity', dataIndex: 'quantity' },
              { title: 'From Base', dataIndex: 'fromBase' },
              { title: 'To Bsse',dataIndex:'toBase'},

              {
                title: 'Transferred By',
                dataIndex: 'transferredBy',
                render: (user) => `${user?.name} (${user?.email})`,
              },
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

export default TransferPage;
