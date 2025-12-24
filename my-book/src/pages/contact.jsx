import React, { useState } from 'react';
import Layout from '@theme/Layout';
import styles from './contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');

    // Create mailto link with form data
    const mailtoLink = `mailto:abdulhakeem7978@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success message
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setStatus('');
      }, 5000);
    }, 500);
  };

  return (
    <Layout
      title="Contact Us"
      description="Get in touch with us about Physical AI and Humanoid Robotics">
      <div className={styles.contactContainer}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            Have questions? We'd love to hear from you!
          </p>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📧</div>
              <h3>Email</h3>
              <p>
                <a
                  href="mailto:abdulhakeem7978@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  abdulhakeem7978@gmail.com
                </a>
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🔗</div>
              <h3>GitHub</h3>
              <p>
                <a
                  href="https://github.com/itishakeem/physical-ai-humanoid-robotics-textbook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Repository
                </a>
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>💬</div>
              <h3>Community</h3>
              <p>Join our discussions and collaborate</p>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
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

              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'success' && (
                <div className={styles.successMessage}>
                  ✓ Message sent successfully! We'll get back to you soon.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
