import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, List, Card, Modal, Input, message, Typography, Tag, 
  QRCode, Space, Tabs, Tooltip, Alert, Grid 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  CopyOutlined, LinkOutlined, UploadOutlined, CameraOutlined,
  QrcodeOutlined, ClockCircleOutlined 
} from '@ant-design/icons';
import { Scanner } from '@yudiel/react-qr-scanner';
import jsQR from 'jsqr';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { auth, db } from '../database/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const Home = () => {
  const screens = useBreakpoint();
  const [qrCodes, setQrCodes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isScanModalVisible, setIsScanModalVisible] = useState(false);
  const [scanMode, setScanMode] = useState('camera');
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentQr, setCurrentQr] = useState(null);
  const [scanData, setScanData] = useState('');
  const [saveTitle, setSaveTitle] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const fileInputRef = useRef();

  const headerPadding = screens.xs ? 16 : 24;
  const headerIconSize = screens.xs ? 24 : 32;
  const modalWidth = screens.xs ? '90vw' : 600;
  const scannerHeight = screens.xs ? '60vh' : 400;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) setUserId(user.uid);
      else { setUserId(null); setQrCodes([]); }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userId) return;
    const qrCodesRef = ref(db, `accounts/${userId}/qrCodes`);
    const unsubscribe = onValue(qrCodesRef, snapshot => {
      const data = snapshot.val() || {};
      setQrCodes(Object.entries(data).map(([id, value]) => ({ id, ...value })));
    });
    return () => unsubscribe();
  }, [userId]);

  const handleScan = detected => {
    if (detected.length > 0) {
      const raw = detected[0].rawValue;
      finishScan(raw);
    }
  };

  const handleScanError = err => {
    if (err.name === 'NotFoundError') {
      message.error('No camera device found. Please switch to File mode or allow camera access.');
    } else {
      message.error(`Scan error: ${err.message}`);
    }
  };

  const onSelectFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code?.data) finishScan(code.data);
        else message.error('No QR code found in image');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const finishScan = rawValue => {
    setScanData(rawValue);
    setIsScanModalVisible(false);
    setIsSaveModalVisible(true);
  };

  const handleSave = () => {
    if (!saveTitle.trim()) {
      message.error('Enter a title');
      return;
    }
    const newRef = push(ref(db, `accounts/${userId}/qrCodes`));
    set(newRef, {
      title: saveTitle,
      data: scanData,
      type: scanData.startsWith('http') ? 'URL' : 'TEXT',
      createdAt: Date.now()
    })
      .then(() => {
        message.success('Saved');
        setSaveTitle('');
        setScanData('');
        setIsSaveModalVisible(false);
      })
      .catch(() => message.error('Save failed'));
  };

  const handleEdit = qr => { setCurrentQr(qr); setEditTitle(qr.title); setIsEditModalVisible(true); };
  const saveEdit = () => {
    update(ref(db, `accounts/${userId}/qrCodes/${currentQr.id}`), { title: editTitle })
      .then(() => { message.success('Updated'); setIsEditModalVisible(false); })
      .catch(() => message.error('Update failed'));
  };

  const handleDelete = id => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this QR code?',
      onOk: () => {
        remove(ref(db, `accounts/${userId}/qrCodes/${id}`))
          .then(() => message.success('Deleted'))
          .catch(() => message.error('Delete failed'));
      }
    });
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text)
      .then(() => message.success('Copied'))
      .catch(() => message.error('Copy failed'));
  };

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: screens.xs ? 12 : 24, 
      minHeight: '100vh' 
    }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: screens.xs ? 'column' : 'row',
        justifyContent: 'space-between',  // Added for spacing
        alignItems: screens.xs ? 'stretch' : 'center',
        gap: screens.xs ? 12 : 24,
        marginBottom: 24, 
        padding: headerPadding,
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        {/* Title Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16,
          flexShrink: 0  // Prevent title from shrinking
        }}>
          <QrcodeOutlined style={{ fontSize: headerIconSize, color: '#1890ff' }} />
          <Title level={3} style={{ 
            margin: 0, 
            fontSize: screens.xs ? '1.2rem' : '1.5rem' 
          }}>
            QR Code Manager
          </Title>
        </div>
    
        {/* New Scan Button - Right aligned on desktop */}
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsScanModalVisible(true)}
          size={screens.xs ? 'middle' : 'large'} 
          style={{ 
            borderRadius: 8,
            padding: screens.xs ? '0 12px' : '0 24px',
            height: screens.xs ? 40 : 48,
            width: screens.xs ? '100%' : 'auto',
            marginLeft: screens.xs ? 0 : 'auto'  // Push to right on desktop
          }}
        >
          New Scan
        </Button>
      </div>

      {qrCodes.length === 0 ? (
        <div style={{ textAlign:'center', padding: screens.xs ? 24:48,
                      background:'#fff', borderRadius:12 }}>
          <QrcodeOutlined style={{ fontSize: screens.xs?48:64, color:'#bfbfbf', marginBottom:16 }} />
          <Text type="secondary" style={{ display:'block', fontSize: screens.xs?'0.9rem':'1rem' }}>
            No QR codes found. Start by scanning your first code!
          </Text>
        </div>
      ) : (
        <List grid={{ gutter: screens.xs?16:24, xs:1, sm:2, md:2, lg:3, xl:4 }} dataSource={qrCodes}
              renderItem={qr => (
          <List.Item key={qr.id}>
            <Card
              hoverable
              title={<Text strong ellipsis style={{ fontSize: screens.xs ? '14px' : '16px', lineHeight: 1.2 }}>{qr.title}</Text>}
              actions={[
                <Tooltip title="View"><EyeOutlined onClick={() => { setCurrentQr(qr); setIsViewModalVisible(true); }} /></Tooltip>,
                <Tooltip title="Edit"><EditOutlined onClick={() => handleEdit(qr)} /></Tooltip>,
                <Tooltip title="Delete"><DeleteOutlined onClick={() => handleDelete(qr.id)} /></Tooltip>
              ]}
              styles={{ header: { border: 'none' }, body: { padding: 16 } }}
              style={{ borderRadius: 12, border: '1px solid #f0f0f0', transition: 'transform 0.2s' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Tag color={qr.type === 'URL' ? 'blue' : 'purple'} style={{ alignSelf: 'flex-start', textTransform: 'uppercase' }}>
                  {qr.type}
                </Tag>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockCircleOutlined />
                  <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                    {new Date(qr.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </Text>
                </div>
              </div>
            </Card>
          </List.Item>
        )} />
      )}

      {/* Scan Modal */}
<Modal
  title={<span><CameraOutlined /> Scan QR Code</span>}
  open={isScanModalVisible}
  onCancel={() => setIsScanModalVisible(false)}
  footer={null}
  centered
  width={screens.xs ? '90vw' : '60vw'}
  styles={{ 
    body: { 
      padding: 0,
      minHeight: screens.xs ? '50vh' : '60vh'
    } 
  }}
>
  <Tabs
    activeKey={scanMode}
    onChange={setScanMode}
    centered
    style={{ marginBottom: 24 }}
    items={[
      {
        key: 'camera',
        label: (<span><CameraOutlined /> {screens.xs ? 'Cam' : 'Camera'}</span>),
        children: (
          <div style={{ 
            position: 'relative',
            width: '100%',
            paddingTop: '100%', // Maintain 1:1 aspect ratio
            maxHeight: '70vh',
            margin: '0 auto'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Scanner
                onScan={handleScan}
                onError={handleScanError}
                constraints={{ 
                  facingMode: 'environment',
                  aspectRatio: 1 // Force square aspect ratio
                }}
                scanDelay={500}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 8
                }}
              />
              <div style={{
                position: 'absolute',
                width: '70%',
                height: '70%',
                border: '4px solid #1890ff',
                borderRadius: 8,
                boxShadow: '0 0 20px rgba(24, 144, 255, 0.3)',
                pointerEvents: 'none'
              }} />
            </div>
          </div>
        )
      },
      {
        key: 'file',
        label: (<span><UploadOutlined /> {screens.xs ? 'File' : 'Upload'}</span>),
        children: (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: screens.xs ? 16 : 24,
            minHeight: '40vh'
          }}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={onSelectFile}
            />
            <Button
              icon={<UploadOutlined />}
              type="primary"
              size={screens.xs ? 'middle' : 'large'}
              onClick={() => fileInputRef.current.click()}
              style={{ 
                marginBottom: 16,
                width: screens.xs ? '100%' : 'auto'
              }}
            >
              {screens.xs ? 'Upload Image' : 'Select QR Code Image'}
            </Button>
            <Text type="secondary" style={{ 
              textAlign: 'center',
              fontSize: screens.xs ? 12 : 14
            }}>
              Supported formats: PNG, JPG, JPEG
            </Text>
          </div>
        )
      }
    ]}
  />
</Modal>

     {/* Save Modal */}
<Modal
  title="Save Scanned Data"
  open={isSaveModalVisible}
  onOk={handleSave}
  cancelText="Cancel"
  onCancel={() => { setIsSaveModalVisible(false); setScanData(''); setSaveTitle(''); }}
  okText="Save"
  centered
  width={modalWidth}
  styles={{ body: { padding: screens.xs ? 16 : 24 } }}
>
  <Space direction="vertical" size={24} style={{ width: '100%' }}>
    <div>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>Title</Text>
      <Input 
        placeholder="Enter a descriptive title" 
        value={saveTitle} 
        onChange={e => setSaveTitle(e.target.value)} 
        size="large" 
      />
    </div>
    <div>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>Scanned Content</Text>
      <div style={{ 
        background: '#f8f9fa', 
        padding: 16, 
        borderRadius: 8, 
        position: 'relative',
        paddingRight: 40 // Add space for copy button
      }}>
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-all', 
          margin: 0, 
          fontFamily: 'monospace', 
          maxHeight: '40vh', 
          overflow: 'auto',
          lineHeight: 1.5
        }}>
          {scanData}
        </pre>
        <Button 
          icon={<CopyOutlined />} 
          type="text" 
          onClick={() => copyToClipboard(scanData)}
          style={{ 
            position: 'absolute', 
            right: 8, 
            top: 8,
            zIndex: 1,
            background: '#f8f9fa',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>
    </div>
  </Space>
</Modal>

{/* View Modal */}
<Modal
  title={currentQr?.title}
  open={isViewModalVisible}
  onCancel={() => setIsViewModalVisible(false)}
  footer={null}
  centered
  width={modalWidth}
  styles={{ body: { padding: screens.xs ? 16 : 24 } }}
>
  {currentQr && (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, textAlign: 'center' }}>
        <QRCode 
          value={currentQr.data} 
          size={screens.xs ? 160 : 200} 
          color="#1890ff" 
          bgColor="#ffffff" 
          style={{ margin: '0 auto' }} 
        />
      </div>
      <div style={{ 
        background: '#f8f9fa', 
        padding: 16, 
        borderRadius: 8, 
        position: 'relative',
        paddingRight: 40 // Add space for copy button
      }}>
        {currentQr.type === 'URL' ? (
          <a 
            href={currentQr.data} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              wordBreak: 'break-all', 
              color: '#1890ff', 
              textDecoration: 'none',
              paddingRight: 8
            }}
          >
            <LinkOutlined style={{ marginRight: 8 }} />
            {currentQr.data}
          </a>
        ) : (
          <Text style={{ 
            wordBreak: 'break-all', 
            fontFamily: 'monospace',
            paddingRight: 8
          }}>
            {currentQr.data}
          </Text>
        )}
        <Button 
          icon={<CopyOutlined />} 
          type="text" 
          onClick={() => copyToClipboard(currentQr.data)}
          style={{ 
            position: 'absolute', 
            right: 8, 
            top: 8,
            zIndex: 1,
            background: '#f8f9fa',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>
      <Space wrap>
        <Tag icon={<ClockCircleOutlined />} color="default">
          Created: {new Date(currentQr.createdAt).toLocaleDateString()}
        </Tag>
        <Tag color={currentQr.type === 'URL' ? 'blue' : 'purple'}>
          {currentQr.type}
        </Tag>
      </Space>
    </Space>
  )}
</Modal>
      {/* Edit Modal */}
      <Modal
        title="Edit Title"
        open={isEditModalVisible}
        onOk={saveEdit}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Save Changes"
        cancelText="Discard"
        centered
        width={modalWidth}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Text strong>QR Code Title</Text>
          <Input placeholder="Enter new title" value={editTitle} onChange={e => setEditTitle(e.target.value)} size="large" />
          <Alert message="Changing the title won't affect the QR code content" type="info" showIcon />
        </Space>
      </Modal>
    </div>
  );
};

export default Home;
