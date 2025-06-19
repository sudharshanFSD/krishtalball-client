import { Modal, Descriptions } from 'antd';

const MovementPopup = ({ open, onClose, data }) => {
  return (
    <Modal
      title="Net Movement Breakdown"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Purchased">
          {data?.purchases || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Transfer In">
          {data?.transferIn || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Transfer Out">
          {data?.transferOut || 0}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default MovementPopup;
