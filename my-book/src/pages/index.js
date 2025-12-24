import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout'; // Import Docusaurus default Layout, which we've overridden
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={`button button--secondary button--lg ${styles.button}`}
            to="/docs/intro">
            📖 Start Reading
          </Link>
          <Link
            className={`button button--info button--lg ${styles.button}`}
            to="/docs/chapter1/summary">
            🚀 Go to Chapter 1
          </Link>
        </div>
      </div>
    </header>
  );
}

function ChapterCard({title, description, icon, link}) {
  return (
    <div className={clsx('col col--4', styles.chapterCard)}>
      <Link to={link} className={styles.cardLink}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>{icon}</div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

function TopicsSection() {
  return (
    <section className={styles.topicsSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>📚 Explore Topics</h2>
        <div className="row">
          <ChapterCard
            title="Fundamentals"
            description="Physical AI, embodied intelligence, and perception-cognition-action loops"
            icon="🤖"
            link="/docs/chapter1/summary"
          />
          <ChapterCard
            title="Humanoid Design"
            description="Mechanical structure, kinematics, and design principles"
            icon="🏗️"
            link="/docs/chapter2/summary"
          />
          <ChapterCard
            title="Sensors & Actuators"
            description="Perception systems, actuation, and sensor fusion"
            icon="📊"
            link="/docs/chapter3/summary"
          />
          <ChapterCard
            title="Control Systems"
            description="Control theory, dynamics, kinematics, and whole-body control"
            icon="⚙️"
            link="/docs/chapter4/summary"
          />
          <ChapterCard
            title="AI Integration"
            description="Machine learning, reinforcement learning, and autonomous decision-making"
            icon="🧠"
            link="/docs/chapter5/summary"
          />
          <ChapterCard
            title="Motion & Navigation"
            description="Path planning, SLAM, obstacle avoidance, and locomotion"
            icon="🗺️"
            link="/docs/chapter6/summary"
          />
        </div>
      </div>
    </section>
  );
}

function QuickLinksSection() {
  return (
    <section className={styles.quickLinksSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>⚡ Quick Links</h2>
        <div className="row">
          <div className={clsx('col col--3', styles.quickLink)}>
            <Link to="/docs/chapter1/key_concepts">
              <strong>📖 Key Concepts</strong>
              <p>Core robotics and AI fundamentals</p>
            </Link>
          </div>
          <div className={clsx('col col--3', styles.quickLink)}>
            <Link to="/docs/chapter3/practical_examples">
              <strong>💡 Practical Examples</strong>
              <p>Real-world robotics implementations</p>
            </Link>
          </div>
          <div className={clsx('col col--3', styles.quickLink)}>
            <Link to="/docs/chapter4/diagrams">
              <strong>📊 Diagrams</strong>
              <p>Visual representations and illustrations</p>
            </Link>
          </div>
          <div className={clsx('col col--3', styles.quickLink)}>
            <a href="https://github.com/itishakeem/physical-ai-humanoid-robotics-textbook">
              <strong>🔗 GitHub</strong>
              <p>View source code and contribute</p>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedRobotsSection() {
  return (
    <section className={styles.robotsSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>🤖 Featured Robotics Platforms</h2>
        <div className="row">
          <div className={clsx('col col--4', styles.robot)}>
            <h3>Boston Dynamics Atlas</h3>
            <p>State-of-the-art humanoid with advanced locomotion and whole-body control</p>
          </div>
          <div className={clsx('col col--4', styles.robot)}>
            <h3>Tesla Optimus</h3>
            <p>Industrial humanoid robot for manufacturing and task automation</p>
          </div>
          <div className={clsx('col col--4', styles.robot)}>
            <h3>Hanson Sophia</h3>
            <p>Social humanoid with advanced interaction and expression capabilities</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="A comprehensive textbook on Physical AI and Humanoid Robotics with animations, diagrams, and real-world examples">
      <HomepageHeader />
      <main>
        <TopicsSection />
        <QuickLinksSection />
        <FeaturedRobotsSection />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
