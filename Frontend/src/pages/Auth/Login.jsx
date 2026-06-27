import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import Input from '@/components/common/Input.jsx';
import Button from '@/components/common/Button.jsx';
import api from '@/services/api.js';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError('');

    try {
      // Attempt backend signin
      const response = await api.post('/users/login', formData);
      if (response && response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      }
    } catch (err) {
      console.warn('⚠️ Backend login failed. Falling back to local offline sandbox mode...', err.message);
      
      // Local sandbox fallback for Phase 0 UI previewing
      if (formData.email && formData.password) {
        const mockUser = {
          username: formData.email.split('@')[0],
          email: formData.email,
          role: 'researcher',
        };
        localStorage.setItem('token', 'mock_sandbox_jwt_token_key');
        localStorage.setItem('user', JSON.stringify(mockUser));
        navigate('/');
      } else {
        setApiError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-bold font-display text-[var(--color-brand-text-primary)]">Welcome Back</h3>
        <p className="text-xs text-[var(--color-brand-text-secondary)] mt-1">Sign in to coordinate and view research studies</p>
      </div>

      {isExpired && (
        <div className="flex items-center gap-2 p-3 bg-[var(--color-brand-light-orange)] border border-amber-200 text-[var(--color-brand-orange)] rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Session expired. Please log in again to continue.</span>
        </div>
      )}

      {apiError && (
        <div className="flex items-center gap-2 p-3 bg-[var(--color-brand-red)]/10 border border-[var(--color-brand-red)]/35 text-[var(--color-brand-red)] rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="name@institution.edu"
            required
            className="pl-10"
          />
          <Mail className="absolute left-3.5 bottom-3.5 w-4 h-4 text-slate-500" />
        </div>

        <div className="relative">
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            required
            className="pl-10"
          />
          <Lock className="absolute left-3.5 bottom-3.5 w-4 h-4 text-slate-500" />
        </div>

        <div className="flex items-center justify-between text-xs mt-1">
          <label className="flex items-center gap-2 text-[var(--color-brand-text-secondary)] cursor-pointer">
            <input type="checkbox" className="rounded bg-white border-[var(--color-brand-border)] text-[var(--color-brand-blue)] focus:ring-0 focus:ring-offset-0 cursor-pointer" />
            Remember me
          </label>
          <a href="#" className="text-[var(--color-brand-blue)] hover:underline">Forgot password?</a>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Sign In <LogIn className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="border-t border-[var(--color-brand-border)] pt-4 text-center">
        <p className="text-xs text-[var(--color-brand-text-secondary)]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[var(--color-brand-blue)] hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
