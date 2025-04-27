import { Dialog } from '@headlessui/react'
import { useState } from 'react'

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault() // Prevent page reload
    // Add your login logic here
    console.log('Logging in with:', { email, password })
    onClose() // Close modal after submission
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto" // Increased z-index
    >
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Panel className="relative bg-white rounded-xl p-8 max-w-md w-full transform transition-all">
          <Dialog.Title className="text-2xl font-bold mb-6">
            Login to QRSave
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default LoginModal