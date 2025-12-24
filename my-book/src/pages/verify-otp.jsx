import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '@site/src/contexts/AuthContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useHistory } from '@docusaurus/router';
import { API_CONFIG } from '../config';
import './auth.css';

const API_BASE_URL = API_CONFIG.AUTH_URL;

export default function VerifyOTP() {
  const { login } = useAuth();
  const history = useHistory();
  const baseUrl = useBaseUrl('');
  const signupUrl = useBaseUrl('/signup');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from URL params or localStorage
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const storedEmail = localStorage.getItem('pending_signup_email');

    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('pending_signup_email', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email found, redirect to signup
      history.push(signupUrl);
      return;
    }

    // Set countdown timer
    setCountdown(60);
  }, [history]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(digits.length, 5)]?.focus();
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp_code: otpCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'OTP verification failed');
      }

      // Store token and user info via auth context
      login(data.access_token, data.user);
      
      // Clear pending signup email
      localStorage.removeItem('pending_signup_email');
      
      setSuccess(true);
      
      // Redirect to home after showing success message
      setTimeout(() => {
        history.push(baseUrl);
      }, 2000);

    } catch (error) {
      setErrors({ submit: error.message || 'Invalid or expired OTP. Please try again.' });
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend OTP');
      }

      // Reset countdown
      setCountdown(60);
      setErrors({ submit: 'OTP resent successfully! Check your email.' });
      
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

    } catch (error) {
      setErrors({ submit: error.message || 'Failed to resend OTP. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <Layout title="Email Verified">
        <div className="auth-container">
          <div className="auth-card success-card">
            <div className="success-icon">✓</div>
            <h2>Email Verified Successfully!</h2>
            <p>Your account has been created. Redirecting you to the homepage...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Verify Email">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Verify Your Email</h1>
            <p>We've sent a 6-digit code to <strong>{email}</strong></p>
            <div className="info-banner" style={{
              background: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '16px',
              fontSize: '14px',
              color: '#1565c0'
            }}>
              💡 <strong>Development Mode:</strong> Check your backend terminal/console for the OTP code.
              It will appear as: <code>INFO: OTP for {email}: 123456</code>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`otp-input ${errors.otp ? 'error' : ''}`}
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            {errors.otp && <span className="error-message otp-error">{errors.otp}</span>}

            {errors.submit && (
              <div className={`error-banner ${errors.submit.includes('resent') ? 'success-banner' : ''}`}>
                {errors.submit}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={isLoading || otp.join('').length !== 6}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="auth-footer">
              <p>
                Didn't receive the code?{' '}
                {countdown > 0 ? (
                  <span className="countdown">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="resend-link"
                  >
                    {isResending ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </p>
              <p style={{ marginTop: '12px' }}>
                <a href="/signup">Change email address</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

