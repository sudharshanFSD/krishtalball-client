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
  Result,
} from 'antd';

import dayjs from 'dayjs';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const { RangePicker } = DatePicker;

const ExpenditurePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ type: '', dates: [] });
  const [showHistory, setShowHistory] = useState(false); 

  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  //  FORBIDDEN FOR LOGISTICS
  if (user?.role === 'logistics') {
    return (
      <Result
        status="403"
        title="403 Forbidden"
        subTitle="You do not have permission to view this page."
      />
    );
  }

  const { data: filterOptions, isLoading: loadingFilters } = useQuery({
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
        base: user?.role === 'admin' ? data.base : user.base,
        quantity: parseInt(data.quantity),
      };

      const res = await axios.post('https://krishtalball.onrender.com/api/asset/expend', payload, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      message.success('Expenditure recorded');
      reset();
      queryClient.invalidateQueries(['expenditures']);
    },
    onError: (error) => {
      message.error('Failed to record expenditure: ' + (error.response?.data?.message || error.message));
    },
  });

  const { data: expenditures = [], isLoading } = useQuery({
    queryKey: ['expenditures', filters],
    queryFn: async () => {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.dates.length === 2) {
        params.startDate = dayjs(filters.dates[0]).toISOString();
        params.endDate = dayjs(filters.dates[1]).toISOString();
      }
      const res = await axios.get('https://krishtalball.onrender.com/api/asset/getExpenditures', {
        params,
        withCredentials: true,
      });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const handleFilterChange = (changed) => {
    setFilters((prev) => ({ ...prev, ...changed }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Record Expenditure Form */}
      <Card title=" Record Expenditure" bordered={false} style={{ borderRadius: 12 }}>
        <Form layout="vertical" onFinish={handleSubmit(mutation.mutate)}>
          <Row gutter={16}>
            <Col span={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Asset name is required' }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    label="Asset Name"
                    required
                    validateStatus={fieldState.invalid ? 'error' : ''}
                    help={fieldState.error?.message}
                  >
                    <Input {...field} placeholder="E.g. Drone" />
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
                  min: { value: 1, message: 'Minimum is 1' },
                }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    label="Quantity"
                    required
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
                    required
                    validateStatus={fieldState.invalid ? 'error' : ''}
                    help={fieldState.error?.message}
                  >
                    <Select
                      {...field}
                      placeholder="Select asset type"
                      loading={loadingFilters}
                      options={filterOptions?.types?.map((t) => ({ label: t, value: t }))}
                    />
                  </Form.Item>
                )}
              />
            </Col>

            {user?.role === 'admin' && (
              <Col span={12}>
                <Controller
                  name="base"
                  control={control}
                  rules={{ required: 'Base is required' }}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="Base"
                      required
                      validateStatus={fieldState.invalid ? 'error' : ''}
                      help={fieldState.error?.message}
                    >
                      <Select
                        {...field}
                        placeholder="Select base"
                        loading={loadingFilters}
                        options={filterOptions?.bases?.map((b) => ({ label: b, value: b }))}
                      />
                    </Form.Item>
                  )}
                />
              </Col>
            )}

            <Col span={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" loading={mutation.isPending}>
                  Record Expenditure
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Toggle Button */}
      <Button
        type="default"
        onClick={() => setShowHistory(!showHistory)}
        style={{ marginTop: 8 }}
      >
        {showHistory ? ' Hide History' : ' Show History'}
      </Button>

      {/*  History Table */}
      {showHistory && (
        <Card title="Expenditure History" bordered={false} style={{ borderRadius: 12 }}>
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
            dataSource={expenditures}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            columns={[
              { title: 'Asset', dataIndex: 'assetName' },
              { title: 'Type', dataIndex: 'type' },
              { title: 'Quantity', dataIndex: 'quantity' },
              { title: 'Base', dataIndex: 'base' },
              {
                title: 'Expended By',
                dataIndex: 'expendedBy',
                render: (user) => `${user?.name || 'User'} (${user?.email || '-'})`,
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

export default ExpenditurePage;
