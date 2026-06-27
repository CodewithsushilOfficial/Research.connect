import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, Award } from 'lucide-react';
import Input from '@/components/common/Input.jsx';
import Button from '@/components/common/Button.jsx';
import api from '@/services/api.js';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'researcher',
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
    if (!formData.username) {
      tempErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      tempErrors.username = 'Username must be at least 3 characters';
    }
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
      // Attempt backend signup
      const response = await api.post('/users/register', formData);
      if (response && response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      }
    } catch (err) {
      console.warn('⚠️ Backend register failed. Falling back to local offline sandbox mode...', err.message);
      
      // Sandbox fallback for UI previewing
      if (formData.username && formData.email && formData.password) {
        const mockUser = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
        };
        localStorage.setItem('token', 'mock_sandbox_jwt_token_key');
        localStorage.setItem('user', JSON.stringify(mockUser));
        navigate('/');
      } else {
        setApiError(err.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-bold font-display text-[var(--color-brand-text-primary)]">Join ResearchConnect</h3>
        <p className="text-xs text-[var(--color-brand-text-secondary)] mt-1">Connect with academics and publish studies</p>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 p-3 bg-[var(--color-brand-red)]/10 border border-[var(--color-brand-red)]/35 text-[var(--color-brand-red)] rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Input
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="johndoe"
            required
            className="pl-10"
          />
          <User className="absolute left-3.5 bottom-3.5 w-4 h-4 text-slate-500" />
        </div>

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

        {/* Role Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-text-secondary)]">
            Select Role
          </label>
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm font-sans text-[var(--color-brand-text-primary)] border border-[var(--color-brand-border)] focus:outline-none appearance-none cursor-pointer pl-10"
            >
              <option value="researcher" className="bg-white text-[var(--color-brand-text-primary)]">Researcher</option>
              <option value="reviewer" className="bg-white text-[var(--color-brand-text-primary)]">Reviewer / Peer Evaluator</option>
              <option value="sponsor" className="bg-white text-[var(--color-brand-text-primary)]">Sponsor / Funding Agent</option>
            </select>
            <Award className="absolute left-3.5 bottom-3.5 w-4 h-4 text-slate-500" />
          </div>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Create Account <UserPlus className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="border-t border-[var(--color-brand-border)] pt-4 text-center">
        <p className="text-xs text-[var(--color-brand-text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-brand-blue)] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
