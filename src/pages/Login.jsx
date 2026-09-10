import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      const origin = location.state?.from?.pathname || '/';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter both your username/email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      const origin = location.state?.from?.pathname || '/';
      navigate(origin, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FAF8F5] via-[#F4ECE1] to-[#E9DEC9]/50">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-stone-300/40 border border-stone-200/90 p-8 sm:p-10">
          {/* Header with Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-3">
              <Logo className="h-20 w-20" showText={false} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              ස්වස්තික
            </h1>
            <p className="text-xs font-semibold text-gold-700 uppercase tracking-widest mt-0.5">
              Floral Decor • Admin Portal
            </p>
            <p className="text-stone-500 text-xs mt-2">
              Sign in to manage categories & decoration galleries
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or admin@floristdecor.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500/25 focus:border-gold-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500/25 focus:border-gold-600 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-gold-600 hover:bg-gold-700 active:bg-gold-800 rounded-xl shadow-md shadow-gold-700/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-400">
              Default credentials: <span className="text-stone-600 font-mono">admin</span> / <span className="text-stone-600 font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
