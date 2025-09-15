import React, { useState } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';

const FirebaseLogin = ({ onNavigate }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loginMethod, setLoginMethod] = useState('username'); // 'username' or 'email'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { adminLogin, signIn } = useFirebaseAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (loginMethod === 'email') {
        // Firebase Auth login
        await signIn(credentials.username, credentials.password);
      } else {
        // Custom admin login
        await adminLogin(credentials.username, credentials.password);
      }
      
      console.log('✅ Login successful');
      onNavigate('admin');
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <span className="text-6xl">🎭</span>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Access the festival management dashboard
            </p>
          </div>
        </div>

        {/* Login Method Toggle */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setLoginMethod('username')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              loginMethod === 'username'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Username Login
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              loginMethod === 'email'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Email Login
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                {loginMethod === 'email' ? 'Email Address' : 'Username'}
              </label>
              <input
                id="username"
                name="username"
                type={loginMethod === 'email' ? 'email' : 'text'}
                required
                className="input-mobile"
                placeholder={loginMethod === 'email' ? 'admin@example.com' : 'admin'}
                value={credentials.username}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-mobile"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">❌</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`btn-mobile ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Default Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Default Admin Credentials</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p><strong>Username:</strong> admin</p>
                  <p><strong>Password:</strong> admin123</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="btn-outline-mobile"
            >
              ← Back to Dashboard
            </button>
          </div>
        </form>

        {/* Firebase Status Indicator */}
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Firebase Connected
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseLogin;
