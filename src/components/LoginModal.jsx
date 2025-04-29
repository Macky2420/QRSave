import { Modal, Input, Button } from 'antd';
import { useState } from 'react';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your login logic here
    console.log('Logging in with:', { email, password });
    onClose();
  };

  return (
    <Modal
      title="Login to QRSave"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className="max-w-md w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          size="large"
        />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            size="large"
            autoComplete="current-password"
          />
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          className="mt-4"
        >
          Sign In
        </Button>
      </form>
    </Modal>
  );
};

export default LoginModal;