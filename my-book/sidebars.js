// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Chapter 1: Fundamentals of Physical AI',
      items: [
        'chapter1/summary',
        'chapter1/key_concepts',
        'chapter1/practical_examples',
        'chapter1/diagrams',
      ],
    },
    {
      type: 'category',
      label: 'Chapter 2: Humanoid Robotics Design',
      items: [
        'chapter2/summary',
        'chapter2/key_concepts',
        'chapter2/practical_examples',
        'chapter2/diagrams',
      ],
    },
    {
      type: 'category',
      label: 'Chapter 3: Sensors and Actuators',
      items: [
        'chapter3/summary',
        'chapter3/key_concepts',
        'chapter3/practical_examples',
        'chapter3/diagrams',
      ],
    },
    {
      type: 'category',
      label: 'Chapter 4: Control Systems',
      items: [
        'chapter4/summary',
        'chapter4/key_concepts',
        'chapter4/practical_examples',
        'chapter4/diagrams',
      ],
    },
    {
      type: 'category',
      label: 'Chapter 5: AI Integration',
      items: [
        'chapter5/summary',
        'chapter5/key_concepts',
        'chapter5/practical_examples',
        'chapter5/diagrams',
      ],
    },
    {
      type: 'category',
      label: 'Chapter 6: Motion and Navigation',
      items: [
        'chapter6/summary',
        'chapter6/key_concepts',
        'chapter6/practical_examples',
        'chapter6/diagrams',
      ],
    },
  ],
};

export default sidebars;
