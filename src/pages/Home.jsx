import React, { useState, useEffect } from 'react';
import { Button, List, Card, Modal, Input, message, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, QrcodeOutlined } from '@ant-design/icons';
import { ref, onValue, remove, update } from 'firebase/database';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Home = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [isScanModalVisible, setIsScanModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentQr, setCurrentQr] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();

  // Fetch QR codes from Firebase
  useEffect(() => {
    const qrCodesRef = ref(db, 'accounts/userId/qrCodes'); // Replace userId with actual user ID
    onValue(qrCodesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const qrList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setQrCodes(qrList);
      }
    });
  }, []);

  const handleScan = () => {
    setIsScanModalVisible(true);
    // Implement QR scanning logic here
  };

  const handleView = (qr) => {
    // Navigate to detailed view or show in modal
    message.info(`Viewing: ${qr.title}`);
  };

  const handleEdit = (qr) => {
    setCurrentQr(qr);
    setEditTitle(qr.title);
    setIsEditModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete QR Code',
      content: 'Are you sure you want to delete this QR code?',
      onOk: () => {
        remove(ref(db, `accounts/userId/qrCodes/${id}`))
          .then(() => message.success('QR code deleted'))
          .catch(() => message.error('Failed to delete'));
      }
    });
  };

  const saveEdit = () => {
    update(ref(db, `accounts/userId/qrCodes/${currentQr.id}`), {
      title: editTitle
    })
      .then(() => {
        message.success('Updated successfully');
        setIsEditModalVisible(false);
      })
      .catch(() => message.error('Update failed'));
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header with Scan Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Title level={3}>My QR Codes</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleScan}
        >
          Scan QR Code
        </Button>
      </div>

      {/* QR Codes List */}
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={qrCodes}
        renderItem={(qr) => (
          <List.Item>
            <Card
              title={qr.title}
              actions={[
                <EyeOutlined key="view" onClick={() => handleView(qr)} />,
                <EditOutlined key="edit" onClick={() => handleEdit(qr)} />,
                <DeleteOutlined key="delete" onClick={() => handleDelete(qr.id)} />,
              ]}
            >
              <div style={{ wordBreak: 'break-all' }}>
                <Text strong>Type:</Text> {qr.type}<br />
                <Text strong>Created:</Text> {new Date(qr.createdAt).toLocaleString()}
              </div>
            </Card>
          </List.Item>
        )}
      />

      {/* Scan QR Modal */}
      <Modal
        title="Scan QR Code"
        visible={isScanModalVisible}
        onCancel={() => setIsScanModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <QrcodeOutlined style={{ fontSize: '100px', marginBottom: '20px' }} />
          <p>Point your camera at a QR code to scan</p>
          <Button type="primary">Open Camera</Button>
        </div>
      </Modal>

      {/* Edit Title Modal */}
      <Modal
        title="Edit QR Code"
        visible={isEditModalVisible}
        onOk={saveEdit}
        onCancel={() => setIsEditModalVisible(false)}
      >
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="QR Code Title"
        />
      </Modal>
    </div>
  );
};

export default Home;