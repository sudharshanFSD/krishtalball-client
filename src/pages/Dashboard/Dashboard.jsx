import {
  Card,
  Select,
  Space,
  Statistic,
  DatePicker,
  Row,
  Col,
  Modal,
  Spin,
  Typography,
} from 'antd';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeploymentUnitOutlined,
  StockOutlined,
  ThunderboltOutlined,
  FundViewOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ base: '', type: '', dates: [] });
  const [movementVisible, setMovementVisible] = useState(false);

  // Fetch dashboard summary
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardSummary', filters],
    queryFn: async () => {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (user.role === 'admin' && filters.base) params.base = filters.base;
      const res = await axios.get('https://krishtalball.onrender.com/api/asset/summary', {
        params,
        withCredentials: true,
      });
      return res.data;
    },
  });

  // Fetch filter options (bases, types)
  const { data: filterOptions, isLoading: loadingFilters } = useQuery({
    queryKey: ['assetFilters'],
    queryFn: async () => {
      const res = await axios.get('https://krishtalball.onrender.com/api/asset/filters', {
        withCredentials: true,
      });
      return res.data;
    },
  });

  const handleChange = (changed) => {
    setFilters((prev) => ({ ...prev, ...changed }));
  };

  const calculateNetMovement = () => {
    const { purchases = 0, transferIn = 0, transferOut = 0 } = data?.netMovement || {};
    return purchases + transferIn - transferOut;
  };

  return (
    <div style={{ padding: '32px' }}>
      <Title level={3}>📊 Military Asset Dashboard</Title>

      {/* Filters */}
      <Space wrap size="middle" style={{ marginBottom: 32 }}>
        {user.role === 'admin' && (
          <Select
            placeholder="Select Base"
            style={{ width: 200 }}
            onChange={(val) => handleChange({ base: val })}
            loading={loadingFilters}
            allowClear
          >
            {filterOptions?.bases?.map((base) => (
              <Select.Option key={base} value={base}>
                {base}
              </Select.Option>
            ))}
          </Select>
        )}
        <Select
          placeholder="Select Asset Type"
          style={{ width: 200 }}
          onChange={(val) => handleChange({ type: val })}
          loading={loadingFilters}
          allowClear
        >
          {filterOptions?.types?.map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
        <RangePicker onChange={(dates) => handleChange({ dates })} />
      </Space>

      {/* Loader */}
      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Primary Statistics */}
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card bordered style={{ borderLeft: '5px solid #1890ff', borderRadius: 8 }}>
                <Statistic title="Opening Balance" value={data?.openingBalance || 0} prefix={<StockOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card
                bordered
                hoverable
                onClick={() => setMovementVisible(true)}
                style={{ borderLeft: '5px solid #13c2c2', borderRadius: 8 }}
              >
                <Statistic title="Net Movement" value={calculateNetMovement()} prefix={<DeploymentUnitOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered style={{ borderLeft: '5px solid #52c41a', borderRadius: 8 }}>
                <Statistic title="Closing Balance" value={data?.closingBalance || 0} prefix={<FundViewOutlined />} />
              </Card>
            </Col>
          </Row>

          {/* Secondary Statistics */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col span={8}>
              <Card bordered style={{ borderLeft: '5px solid #faad14', borderRadius: 8 }}>
                <Statistic title="Assigned" value={data?.assigned || 0} prefix={<ArrowUpOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered style={{ borderLeft: '5px solid #f5222d', borderRadius: 8 }}>
                <Statistic title="Expended" value={data?.expended || 0} prefix={<ArrowDownOutlined />} />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Modal: Movement Breakdown */}
      <Modal
        title="🧾 Movement Breakdown"
        open={movementVisible}
        onCancel={() => setMovementVisible(false)}
        footer={null}
      >
        <p>
          <ThunderboltOutlined style={{ marginRight: 8 }} />
          <strong>Purchases:</strong> {data?.netMovement?.purchases || 0}
        </p>
        <p>
          <ArrowUpOutlined style={{ marginRight: 8 }} />
          <strong>Transfers In:</strong> {data?.netMovement?.transferIn || 0}
        </p>
        <p>
          <ArrowDownOutlined style={{ marginRight: 8 }} />
          <strong>Transfers Out:</strong> {data?.netMovement?.transferOut || 0}
        </p>
      </Modal>
    </div>
  );
};

export default Dashboard;
