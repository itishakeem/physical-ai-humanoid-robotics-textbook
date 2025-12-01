import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Foundations of Physical AI',
    description: (
      <>
        Explore the core principles of Physical AI, understanding embodied intelligence and its distinction from theoretical AI. Learn about the historical context and evolution of AI in physical systems.
      </>
    ),
  },
  {
    title: 'Humanoid Robotics Essentials',
    description: (
      <>
        Delve into the fundamental components of humanoid robots, including their skeletal structure, joints, degrees of freedom, and locomotion systems. Understand the mechanics that bring humanoids to life.
      </>
    ),
  },
  {
    title: 'AI-Powered Interaction and Control',
    description: (
      <>
        Discover how AI enhances humanoid robots with advanced control systems, perception, and human-robot interaction capabilities. Learn about the AI pipeline that enables robots to perceive, reason, and act.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
