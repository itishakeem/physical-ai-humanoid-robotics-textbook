// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'A Comprehensive Textbook on Embodied Intelligence and Advanced Robotics Systems',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://physical-ai-robotics.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/physical-ai-humanoid-robotics-textbook/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'itishakeem', // Usually your GitHub org/user name.
  projectName: 'physical-ai-humanoid-robotics-textbook', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Physical AI & Humanoid Robotics',
        logo: {
          alt: 'Robotics Textbook',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '📚 Chapters',
          },
          {
            label: '📖 Topics',
            position: 'left',
            items: [
              {
                label: 'Fundamentals of Physical AI',
                to: '/docs/chapter1/summary',
              },
              {
                label: 'Humanoid Design Principles',
                to: '/docs/chapter2/summary',
              },
              {
                label: 'Sensors & Actuators',
                to: '/docs/chapter3/summary',
              },
              {
                label: 'Control Systems',
                to: '/docs/chapter4/summary',
              },
              {
                label: 'AI Integration',
                to: '/docs/chapter5/summary',
              },
              {
                label: 'Motion & Navigation',
                to: '/docs/chapter6/summary',
              },
            ],
          },
          {
            label: '🤖 Key Concepts',
            position: 'left',
            items: [
              {
                label: 'Embodied Intelligence',
                to: '/docs/chapter1/key_concepts',
              },
              {
                label: 'Kinematics & Dynamics',
                to: '/docs/chapter4/key_concepts',
              },
              {
                label: 'Machine Learning',
                to: '/docs/chapter5/key_concepts',
              },
              {
                label: 'Path Planning',
                to: '/docs/chapter6/key_concepts',
              },
            ],
          },
          {
            label: '💡 Examples',
            position: 'left',
            items: [
              {
                label: 'Practical Applications',
                to: '/docs/chapter3/practical_examples',
              },
              {
                label: 'Control Examples',
                to: '/docs/chapter4/practical_examples',
              },
              {
                label: 'Real-World Robots',
                to: '/docs/chapter5/practical_examples',
              },
              {
                label: 'Navigation Systems',
                to: '/docs/chapter6/practical_examples',
              },
            ],
          },
          {
            href: 'https://github.com/itishakeem/physical-ai-humanoid-robotics-textbook',
            label: '🔗 GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '📚 All Chapters',
            items: [
              {
                label: 'Chapter 1: Fundamentals',
                to: '/docs/chapter1/summary',
              },
              {
                label: 'Chapter 2: Humanoid Design',
                to: '/docs/chapter2/summary',
              },
              {
                label: 'Chapter 3: Sensors & Actuators',
                to: '/docs/chapter3/summary',
              },
              {
                label: 'Chapter 4: Control Systems',
                to: '/docs/chapter4/summary',
              },
              {
                label: 'Chapter 5: AI Integration',
                to: '/docs/chapter5/summary',
              },
              {
                label: 'Chapter 6: Motion & Navigation',
                to: '/docs/chapter6/summary',
              },
            ],
          },
          {
            title: '🎓 Learning Resources',
            items: [
              {
                label: 'Key Concepts',
                to: '/docs/chapter1/key_concepts',
              },
              {
                label: 'Practical Examples',
                to: '/docs/chapter3/practical_examples',
              },
              {
                label: 'Diagrams & Visualizations',
                to: '/docs/chapter3/diagrams',
              },
            ],
          },
          {
            title: '🚀 Community & Resources',
            items: [
              {
                label: 'GitHub Repository',
                href: 'https://github.com/itishakeem/physical-ai-humanoid-robotics-textbook',
              },
              {
                label: 'Report Issues',
                href: 'https://github.com/itishakeem/physical-ai-humanoid-robotics-textbook/issues',
              },
              {
                label: 'Contribute',
                href: 'https://github.com/itishakeem/physical-ai-humanoid-robotics-textbook/pulls',
              },
            ],
          },
          {
            title: '✍️ About',
            items: [
              {
                label: 'Author: Abdul Hakeem',
                to: '/docs/intro',
              },
              {
                label: 'Physical AI Research',
                href: '#',
              },
              {
                label: 'Embodied Intelligence',
                href: '#',
              },
            ],
          },
        ],
        copyright: `<strong>Copyright © ${new Date().getFullYear()} Abdul Hakeem</strong> | All rights reserved | Built with <span style="color: #ff6b6b;">❤️</span> using Docusaurus | <a href="https://github.com/itishakeem/physical-ai-humanoid-robotics-textbook" target="_blank">View on GitHub</a>`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
