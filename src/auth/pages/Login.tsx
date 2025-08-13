
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import SEO from '../../components/SEO';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Firebase Google authentication
      console.log('Google login clicked');
      
      // Mock authentication for demo purposes
      const mockUser = {
        id: 1,
        email: 'demo@huesapply.com',
        first_name: 'Demo',
        last_name: 'User',
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: new Date().toISOString(),
        last_login: new Date().toISOString(),
        user_type: undefined,
        is_onboarding_complete: false,
      };
      
      setUser(mockUser);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic validation
    const newErrors: {email?: string; password?: string} = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implement Firebase email/password authentication
      console.log('Email login:', formData);
      
      // Mock authentication for demo purposes
      const mockUser = {
        id: 2,
        email: formData.email,
        first_name: 'User',
        last_name: 'Demo',
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: new Date().toISOString(),
        last_login: new Date().toISOString(),
        user_type: undefined,
        is_onboarding_complete: false,
      };
      
      setUser(mockUser);
      navigate('/dashboard');
    } catch (error) {
      console.error('Email login error:', error);
      setErrors({ email: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Set demo user for UI demonstration
    const demoUser = {
      id: 1,
      email: 'demo@huesapply.com',
      first_name: 'Demo',
      last_name: 'User',
      is_active: true,
      is_staff: false,
      is_superuser: false,
      date_joined: new Date().toISOString(),
      last_login: new Date().toISOString(),
      user_type: undefined,
      is_onboarding_complete: false,
    };
    
    setUser(demoUser);
    navigate('/dashboard');
  };
  return (
    <>
      <SEO
        title="Sign In | Hues Apply"
        description="Sign in to your Hues Apply account to access jobs, scholarships, and grants. Secure login for your career platform."
        keywords="login, sign in, authentication, account access, secure login, job search login, scholarship platform login"
        url="https://huesapply.com/login"
        tags={['login', 'authentication', 'sign in', 'account']}
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url('/hero/path-to-star-texture.png')`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat'
          }}
        />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-20 blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-20 blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-indigo-200 to-blue-300 rounded-full opacity-20 blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-bounce"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-indigo-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>

        <img
          src={"/hero/hues_apply_logo.svg"}
          alt="Hues Apply"
          className="absolute top-6 left-6 h-24 w-32 text-[#4DA5E2] hidden md:block z-10"
        />

        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative z-10 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue your journey</p>
          </div>

          <div className="flex mb-6 rounded-lg overflow-hidden shadow-sm">
            <Link
              to="/signup"
              className="flex-1 py-3 border bg-gray-50 text-center text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Sign Up
            </Link>
            <button
              className="flex-1 py-3 border border-l-0 bg-blue-500 text-white font-medium transition-colors"
              disabled
            >
              Log In
            </button>
          </div>

          {/* Google Sign In Button */}
          <div className="mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="text-xl" />
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center space-y-4">
            <div>
              <button
                onClick={handleDemoLogin}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
              >
                Try Demo Account
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              By clicking continue, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>

            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
