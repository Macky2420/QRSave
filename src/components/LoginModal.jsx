import { Modal, Input, Button, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../database/firebaseConfig';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      message.success('Login successful!');
      onClose();
      navigate(`/home/${user.uid}`);
      
      // Clear form
      setEmail('');
      setPassword('');
      
    } catch (err) {
      setLoading(false);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email format');
          break;
        case 'auth/user-not-found':
          setError('User not found');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Account temporarily disabled');
          break;
        default:
          setError('Login failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Login to QRSave"
      open={isOpen}
      onCancel={() => {
        onClose();
        setEmail('');
        setPassword('');
        setError('');
      }}
      footer={null}
      centered
      destroyOnClose
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

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
          className="mt-4"
        >
          Sign In
        </Button>
      </form>
    </Modal>
  );
};

export default LoginModal;