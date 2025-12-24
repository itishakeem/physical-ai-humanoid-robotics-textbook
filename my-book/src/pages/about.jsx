import React from 'react';
import Layout from '@theme/Layout';
import styles from './about.module.css';

export default function About() {
  return (
    <Layout
      title="About Us"
      description="Learn more about Physical AI and Humanoid Robotics">
      <div className={styles.aboutContainer}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>About Us</h1>
          <p className={styles.subtitle}>
            Pioneering the Future of Physical AI and Humanoid Robotics
          </p>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🎯</div>
            <h2>Our Mission</h2>
            <p>
              To democratize knowledge in Physical AI and Humanoid Robotics, making cutting-edge
              technology accessible to students, researchers, and enthusiasts worldwide.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>🚀</div>
            <h2>Our Vision</h2>
            <p>
              Creating a comprehensive learning platform that bridges the gap between theoretical
              concepts and practical applications in embodied intelligence and advanced robotics.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>💡</div>
            <h2>What We Offer</h2>
            <p>
              In-depth tutorials, interactive examples, cutting-edge research insights, and
              hands-on projects covering everything from sensor fusion to autonomous navigation.
            </p>
          </div>
        </div>

        <div className={styles.authorSection}>
          <h2 className={styles.sectionTitle}>About the Author</h2>
          <div className={styles.authorCard}>
            <div className={styles.authorIcon}>👤</div>
            <h3>Abdul Hakeem</h3>
            <p className={styles.authorBio}>
              A passionate researcher and educator in the field of Physical AI and Robotics,
              dedicated to advancing the understanding and application of embodied intelligence
              through comprehensive educational resources.
            </p>
          </div>
        </div>

        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Why Choose This Textbook?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📚</span>
              <h3>Comprehensive Content</h3>
              <p>From fundamentals to advanced topics</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🎨</span>
              <h3>Interactive Diagrams</h3>
              <p>Visual learning with animations</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>💻</span>
              <h3>Practical Examples</h3>
              <p>Real-world implementation code</p>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔬</span>
              <h3>Latest Research</h3>
              <p>Up-to-date with current trends</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
