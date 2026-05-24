export const SITE_TITLE = "Gaurav's Engineering Log";
export const SITE_DESCRIPTION = 'A curated blog covering software engineering, emerging technology, aerospace, health-tech, startups, economics, infrastructure, history, and culinary adventures.';
export const SITE_AUTHOR = 'Gaurav Agarwal';

export const CATEGORIES = [
  'software-engineering',
  'emerging-tech',
  'aerospace',
  'health-tech',
  'startups',
  'economics',
  'infrastructure',
  'history',
  'culinary',
  'micro',
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  'software-engineering': 'Software Engineering',
  'emerging-tech': 'Emerging Tech',
  'aerospace': 'Aerospace',
  'health-tech': 'Health Tech',
  'startups': 'Startups',
  'economics': 'Economics',
  'infrastructure': 'Infrastructure',
  'history': 'History',
  'culinary': 'Culinary',
  'micro': 'Micro',
};

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/getting-started', label: 'Start Here' },
  { href: '/about', label: 'About' },
] as const;

export const SOCIAL_LINKS = {
  github: 'https://github.com/GauravAgarwalGarg',
  linkedin: 'https://www.linkedin.com/in/gauravagarwalgarg/',
  twitter: 'https://x.com/gauravaggarg',
  rss: '/rss.xml',
} as const;

export const PROJECTS = [
  {
    title: 'CourseHub',
    description: 'Curated free courses, conferences & engineering blogs new_textfrom fundamentals to frontier research.',
    url: 'https://github.com/GauravAgarwalGarg/CourseHub',
    tags: ['education', 'open-source', 'curated'],
  },
  {
    title: 'Linux Scripts',
    description: 'Post-install automation for Ubuntu LTS. Modular, idempotent, role-based profiles.',
    url: 'https://github.com/GauravAgarwalGarg/LinuxPostInstallScripts',
    tags: ['linux', 'automation', 'devops'],
  },
  {
    title: 'dotvim',
    description: 'Modern IDE-grade Vim configuration. LSP, fuzzy finding, git integration, floating terminal.',
    url: 'https://github.com/GauravAgarwalGarg/dotvim',
    tags: ['vim', 'developer-tools', 'productivity'],
  },
  {
    title: 'AngelOne Dashboard',
    description: 'Stock market dashboard with real-time data, screeners, and technical indicators.',
    url: 'https://github.com/GauravAgarwalGarg/AngelOneDashboard',
    tags: ['finance', 'python', 'react'],
  },
];
