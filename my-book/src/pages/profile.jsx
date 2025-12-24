import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { API_CONFIG } from '../config';
import './profile.css';

const API_BASE_URL = API_CONFIG.AUTH_URL;

export default function Profile() {
  const history = useHistory();
  const baseUrl = useBaseUrl('/');

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    developer_level: 'Beginner'
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmation: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      history.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        first_name: parsedUser.first_name || '',
        last_name: parsedUser.last_name || '',
        email: parsedUser.email || '',
        username: parsedUser.username || '',
        developer_level: parsedUser.developer_level || 'Beginner'
      });

      // Load profile image from localStorage if exists
      const savedImage = localStorage.getItem(`profile_image_${parsedUser.id}`);
      if (savedImage) {
        setImagePreview(savedImage);
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
      history.push('/login');
    }
  }, [history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDeleteChange = (e) => {
    const { name, value } = e.target;
    setDeleteData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors({ image: 'Image size must be less than 5MB' });
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Save to localStorage
        localStorage.setItem(`profile_image_${user.id}`, reader.result);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call - Replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrors({ confirm_password: 'Passwords do not match' });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setErrors({ new_password: 'Password must be at least 8 characters' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call - Replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Password updated successfully!');
      setIsChangingPassword(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: 'Failed to update password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();

    if (deleteData.confirmation !== 'DELETE') {
      setErrors({ confirmation: 'Please type DELETE to confirm' });
      return;
    }

    if (!deleteData.password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: deleteData.password,
          confirmation: deleteData.confirmation
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete account');
      }

      // Clear all user data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem(`profile_image_${user.id}`);

      // Show success message and redirect
      alert('Your account has been deleted successfully.');
      history.push('/');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to delete account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout title="Profile">
      <div className="profile-container">
        <div className="profile-hero">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account settings and preferences</p>
        </div>

        <div className="profile-content">
          {/* Profile Picture Section */}
          <div className="profile-card profile-picture-card">
            <div className="profile-picture-wrapper">
              <div className="profile-picture">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" />
                ) : (
                  <div className="profile-picture-placeholder">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                )}
              </div>
              <label htmlFor="profile-image-upload" className="upload-button">
                📷 Change Photo
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
              {errors.image && <span className="error-message">{errors.image}</span>}
            </div>

            <div className="profile-info">
              <h2>{user.first_name} {user.last_name}</h2>
              <p className="profile-email">{user.email}</p>
              <span className={`developer-badge ${user.developer_level.toLowerCase()}`}>
                {user.developer_level}
              </span>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="profile-card profile-details-card">
            <div className="card-header">
              <h3>Profile Information</h3>
              {!isEditing && (
                <button
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {successMessage && (
              <div className="success-banner">{successMessage}</div>
            )}

            {errors.submit && (
              <div className="error-banner">{errors.submit}</div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                    {errors.first_name && <span className="error-message">{errors.first_name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                    {errors.last_name && <span className="error-message">{errors.last_name}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  {errors.username && <span className="error-message">{errors.username}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="developer_level">Developer Level</label>
                  <select
                    id="developer_level"
                    name="developer_level"
                    value={formData.developer_level}
                    onChange={handleChange}
                    className="select-input"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        username: user.username,
                        developer_level: user.developer_level
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details-view">
                <div className="detail-item">
                  <span className="detail-label">First Name</span>
                  <span className="detail-value">{user.first_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Name</span>
                  <span className="detail-value">{user.last_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Username</span>
                  <span className="detail-value">{user.username || 'Not set'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Developer Level</span>
                  <span className="detail-value">{user.developer_level}</span>
                </div>
              </div>
            )}
          </div>

          {/* Password Change Section */}
          <div className="profile-card profile-password-card">
            <div className="card-header">
              <h3>Security</h3>
              {!isChangingPassword && (
                <button
                  className="edit-button"
                  onClick={() => setIsChangingPassword(true)}
                >
                  🔒 Change Password
                </button>
              )}
            </div>

            {isChangingPassword && (
              <form onSubmit={handlePasswordSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="current_password">Current Password</label>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new_password">New Password</label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    minLength={8}
                    required
                  />
                  {errors.new_password && <span className="error-message">{errors.new_password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                  />
                  {errors.confirm_password && <span className="error-message">{errors.confirm_password}</span>}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Delete Account Section */}
          <div className="profile-card profile-delete-card">
            <div className="card-header">
              <h3>Danger Zone</h3>
              {!isDeleting && (
                <button
                  className="delete-account-button"
                  onClick={() => setIsDeleting(true)}
                >
                  🗑️ Delete Account
                </button>
              )}
            </div>

            {!isDeleting ? (
              <div className="danger-warning">
                <p>⚠️ Deleting your account is permanent and cannot be undone. All your data will be permanently removed.</p>
              </div>
            ) : (
              <form onSubmit={handleDeleteSubmit} className="profile-form">
                <div className="danger-warning-box">
                  <h4>⚠️ Warning: This action is irreversible!</h4>
                  <p>Deleting your account will permanently remove:</p>
                  <ul>
                    <li>Your profile and personal information</li>
                    <li>All chat history and conversations</li>
                    <li>All saved data and preferences</li>
                  </ul>
                  <p><strong>This cannot be undone!</strong></p>
                </div>

                <div className="form-group">
                  <label htmlFor="delete_password">Enter Your Password to Confirm</label>
                  <input
                    type="password"
                    id="delete_password"
                    name="password"
                    value={deleteData.password}
                    onChange={handleDeleteChange}
                    placeholder="Your current password"
                    required
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="delete_confirmation">Type "DELETE" to confirm</label>
                  <input
                    type="text"
                    id="delete_confirmation"
                    name="confirmation"
                    value={deleteData.confirmation}
                    onChange={handleDeleteChange}
                    placeholder="Type DELETE in capital letters"
                    required
                  />
                  {errors.confirmation && <span className="error-message">{errors.confirmation}</span>}
                </div>

                {errors.submit && (
                  <div className="error-banner">{errors.submit}</div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setIsDeleting(false);
                      setDeleteData({
                        password: '',
                        confirmation: ''
                      });
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="delete-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting Account...' : 'Delete My Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
