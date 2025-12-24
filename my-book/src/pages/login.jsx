import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useHistory } from '@docusaurus/router';
import { useAuth } from '@site/src/contexts/AuthContext';
import './auth.css';

export default function Login() {
  const { login } = useAuth();
  const history = useHistory();
  const baseUrl = useBaseUrl('/');

  const [apiUrl, setApiUrl] = useState('http://127.0.0.1:8000/api/auth');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Set API URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isProduction = window.location.hostname.includes('github.io');
      setApiUrl(isProduction
        ? 'https://physical-ai-humanoid-robotics-textbook-bgc0.onrender.com/api/auth'
        : 'http://127.0.0.1:8000/api/auth'
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.submit) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Get the correct API URL at submit time
    const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
    const currentApiUrl = isProduction
      ? 'https://physical-ai-humanoid-robotics-textbook-bgc0.onrender.com/api/auth'
      : 'http://127.0.0.1:8000/api/auth';

    try {
      const response = await fetch(`${currentApiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      login(data.access_token, data.user);
      history.push(baseUrl); // Home page

    } catch (error) {
      setErrors({ submit: error.message || 'Invalid email or password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Sign In">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {errors.submit && <div className="error-banner">{errors.submit}</div>}

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}