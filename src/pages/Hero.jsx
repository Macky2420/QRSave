import { useState } from 'react'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'

const Hero = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center px-4 max-w-2xl">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to QRSave
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          Manage your QR code data securely. Please authenticate to continue.
        </p>

        {/* Authentication Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => setIsLoginOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg 
                      transition-colors text-lg font-medium shadow-lg hover:shadow-xl
                      w-full sm:w-auto"
          >
            Login to Your Account
          </button>
          
          <span className="text-gray-400 hidden sm:block">|</span>
          
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg 
                      transition-colors text-lg font-medium shadow-lg hover:shadow-xl
                      w-full sm:w-auto"
          >
            Create New Account
          </button>
        </div>

        {/* Security Badge */}
        <div className="mt-12 flex items-center justify-center gap-2 text-gray-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>256-bit encryption</span>
        </div>
      </div>

      {/* Auth Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  )
}

export default Hero