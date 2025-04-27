import { Dialog } from '@headlessui/react'

const RegisterModal = ({ isOpen, onClose }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Panel className="relative bg-white rounded-xl p-8 max-w-md w-full">
          <Dialog.Title className="text-2xl font-bold mb-6">
            Create QRSave Account
          </Dialog.Title>

          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoFocus
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Create Account
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default RegisterModal