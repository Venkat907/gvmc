import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Database,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import DemoBanner from '../components/common/DemoBanner';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect immediately to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/admin');
      } else {
        setErrorMessage(result.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      const serverMsg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Cannot connect to backend server. Render may be waking up, please retry in 10 seconds.'
          : err.message) ||
        'Server error occurred during authentication.';
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('admin@gvmc.gov.in');
    setPassword('Admin@12345');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-gov-700 mx-auto flex items-center justify-center text-white shadow-lg shadow-gov-900/20 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Municipal Portal Administrator
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500">
          Sign in to manage municipal datasets, preview schemas, and review audit logs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg border border-slate-200 rounded-2xl space-y-6">
          {/* Quick Demo Credentials Autofill Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-gov-800">
              <Info className="w-4 h-4 text-gov-600 shrink-0" />
              <span>Demonstration Credentials</span>
            </div>
            <div className="text-[11px] font-mono text-slate-600 bg-white/70 p-2 rounded border border-blue-100">
              Email: <strong>admin@gvmc.gov.in</strong><br />
              Password: <strong>Admin@12345</strong>
            </div>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-left text-xs font-bold text-gov-700 hover:text-gov-900 hover:underline flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Autofill Demo Credentials</span>
            </button>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@gvmc.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-gov-500 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-gov-500 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm bg-gov-600 hover:bg-gov-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Sign In as Administrator'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-slate-400 text-[11px]">
            Protected Government Open Data Administration Gateway (SW61)
            <div className="text-[10px] text-slate-400 font-mono mt-1 break-all">
              Target API: <span className="text-gov-700 font-semibold">{API_BASE_URL}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
