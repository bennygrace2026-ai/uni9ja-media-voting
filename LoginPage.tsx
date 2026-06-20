import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import SEO from '../components/SEO';

import { apiFetch } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'contestant' })
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 relative">
      <SEO 
        title="Contestant Login"
        description="Sign in to your UNI9JA MEDIA contestant account to update your bio, see real-time votes counts, and manage your public presentation."
      />
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-neutral-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-neutral-900">Welcome Back</h2>
          <p className="mt-2 text-neutral-500">Sign in to your account</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-400" />
              </div>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" placeholder="bennygrace2001@gmail.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:ring-[#D60000]" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-[#D60000] hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-600">
          Not a contestant yet? <Link to="/register" className="font-bold text-[#D60000] hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
