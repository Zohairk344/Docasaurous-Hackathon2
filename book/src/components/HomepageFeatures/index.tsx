import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Master Physical AI Foundations',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default, // Reusing existing SVG
    description: (
      <>
        Dive deep into the core concepts of Physical AI, understanding how
        intelligence manifests through embodiment, perception, reasoning, and action
        in real-world robotic systems.
      </>
    ),
  },
  {
    title: 'Hands-on with ROS 2 & Simulations',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default, // Reusing existing SVG
    description: (
      <>
        Gain practical experience with ROS 2, the industry-standard framework for
        robot software development, and explore powerful simulation tools like
        Gazebo, Unity, and NVIDIA Isaac Sim.
      </>
    ),
  },
  {
    title: 'Build Humanoid & Conversational Robots',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default, // Reusing existing SVG
    description: (
      <>
        Learn to design, control, and program advanced humanoid robots. Understand
        Vision-Language-Action (VLA) systems and integrate Large Language Models (LLMs)
        for natural, conversational human-robot interaction.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
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
