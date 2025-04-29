import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../database/firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set } from 'firebase/database';

const RegisterModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;

    // Full name validation
    if (name.trim().length < 5) {
      setNameError('Full name must be at least 5 characters');
      isValid = false;
    } else {
      setNameError('');
    }

    // Email validation
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Save user data to Realtime Database
      await set(ref(db, `accounts/${user.uid}`), {
        name,
        email,
        createdAt: new Date().toISOString(),
      });

      // Clear form inputs
      setName('');
      setEmail('');
      setPassword('');

      message.success('Registration successful!');
      onClose();
      navigate(`/home/${user.uid}`);
    } catch (error) {
      message.error(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Account"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className="max-w-md w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError('');
            }}
            onBlur={() => {
              if (name && name.trim().length < 5) {
                setNameError('Full name must be at least 5 characters');
              }
            }}
            required
            size="large"
            autoComplete="name"
          />
          {nameError && <div className="text-red-500 text-sm mt-1">{nameError}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            onBlur={() => {
              if (email && !email.includes('@')) {
                setEmailError('Please enter a valid email address');
              }
            }}
            required
            size="large"
            autoComplete="email"
          />
          {emailError && <div className="text-red-500 text-sm mt-1">{emailError}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password (min 6 characters)
          </label>
          <Input.Password
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            onBlur={() => {
              if (password && password.length < 6) {
                setPasswordError('Password must be at least 6 characters');
              }
            }}
            required
            size="large"
            autoComplete="new-password"
            minLength={6}
          />
          {passwordError && <div className="text-red-500 text-sm mt-1">{passwordError}</div>}
        </div>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          className="mt-4 bg-blue-600 hover:bg-blue-700"
          loading={loading}
        >
          Create Account
        </Button>
      </form>
    </Modal>
  );
};

export default RegisterModal;
