import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Share2, Lock, RefreshCw, Check } from 'lucide-react';
import authService from '../../../services/auth.service';
import { setCredentials } from '../../../redux/slices/authSlice';
import Button from '../../../components/common/buttons/Button';

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { otpEmail, otpPurpose, isAuthenticated } = useSelector((state) => state.auth);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef([]);

  // Redirect to login only when this page has no pending OTP and the user is not authenticated
  useEffect(() => {
    if (!otpEmail && !isAuthenticated) {
      toast.error('Session expired. Please restart registration or login.');
      navigate('/login');
    }
  }, [otpEmail, isAuthenticated, navigate]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only accept numeric inputs
    if (value && isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Get last char
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      
      // If current input is empty, clear previous and focus it
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(pasteData)) {
      const pasteArray = pasteData.split('');
      setOtp(pasteArray);
      inputRefs.current[5].focus();
    }
  };

  // Submit OTP
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length < 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      let response;
      const purpose = otpPurpose || 'login';

      if (purpose === 'registration') {
        try {
          response = await authService.verifyRegistrationOtp(otpEmail, otpCode);
        } catch (err) {
          // If registration verify fails, try login verify as fallback just in case
          const code = err?.error?.code;
          if (code === 'INVALID_OTP' || code === 'NOT_FOUND' || err?.statusCode === 404) {
            try {
              response = await authService.verifyLoginOtp(otpEmail, otpCode);
            } catch (loginErr) {
              throw loginErr;
            }
          } else {
            throw err;
          }
        }
      } else {
        try {
          response = await authService.verifyLoginOtp(otpEmail, otpCode);
        } catch (err) {
          // If login verify fails, try registration verify as fallback
          const code = err?.error?.code;
          if (code === 'EMAIL_NOT_VERIFIED' || code === 'INVALID_OTP' || code === 'NOT_FOUND' || err?.statusCode === 404) {
            try {
              response = await authService.verifyRegistrationOtp(otpEmail, otpCode);
            } catch (regErr) {
              throw regErr;
            }
          } else {
            throw err;
          }
        }
      }

      if (response && response.success) {
        toast.success(response.message || 'Verification successful!');
        dispatch(setCredentials(response.data));

        // Redirect based on the OTP flow purpose:
        // - registration completes the onboarding flow
        // - login goes straight to the dashboard
        if (purpose === 'registration') {
          navigate('/success');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('OTP verify error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      if (otpPurpose === 'registration') {
        await authService.sendRegistrationOtp(otpEmail);
      } else {
        await authService.sendLoginOtp(otpEmail);
      }
      toast.success('A new 6-digit verification code has been sent to your email.');
      setResendCooldown(60); // Reset timer
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card w-full rounded-2xl p-8 shadow-xl border border-border bg-white bg-opacity-70 backdrop-blur-md text-center"
    >
      <div className="flex flex-col items-center mb-6">
        <span className="p-3 rounded-full bg-light-blue text-primary flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </span>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">Email Verification</h2>
        <p className="text-sm text-text-secondary mt-1">
          We sent a 6-digit code to <br />
          <strong className="text-text-primary">{otpEmail}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 max-w-sm mx-auto" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-40 rounded-xl focus:outline-none transition-all shadow-sm"
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-semibold text-sm shadow-md"
          loading={loading}
          icon={<Check className="w-4 h-4" />}
        >
          Verify Account
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-3">
        <p className="text-xs text-text-secondary">
          Didn't receive the email code?
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className={`flex items-center gap-2 text-xs font-bold transition-colors ${
            resendCooldown > 0 
              ? 'text-text-secondary cursor-not-allowed' 
              : 'text-primary hover:text-primary-hover'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code Now'}
        </button>
      </div>
    </motion.div>
  );
};

export default OtpVerificationPage;
