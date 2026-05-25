export const SITE_TITLE = "Gaurav's Engineering Log";
export const SITE_DESCRIPTION = 'Devices to Cloud new_textsoftware engineering, emerging tech, aerospace, startups, and the occasional poem.';
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
  'poems',
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
  'poems': 'Poems',
  'micro': 'Micro',
};

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Posts' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
] as const;

export const SOCIAL_LINKS = {
  github: 'https://github.com/GauravAgarwalGarg',
  linkedin: 'https://www.linkedin.com/in/gauravagarwalgarg/',
  twitter: 'https://x.com/gauravaggarg',
  rss: '/rss.xml',
} as const;

// Project categories for broader grouping
export type ProjectCategory = 'tools' | 'learning' | 'finance' | 'creative' | 'systems';

export interface Project {
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: ProjectCategory;
}

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  tools: '🛠️ Tools & Automation',
  learning: '📚 Learning & Resources',
  finance: '📈 Finance & Data',
  creative: '🎨 Creative & Web',
  systems: '⚙️ Systems & Low-Level',
};

export const PROJECTS: Project[] = [
  // Tools & Automation
  {
    title: 'Linux Scripts',
    description: 'Post-install automation for Ubuntu LTS. Modular, idempotent, role-based profiles.',
    url: 'https://github.com/GauravAgarwalGarg/LinuxPostInstallScripts',
    tags: ['linux', 'automation', 'bash', 'devops'],
    category: 'tools',
  },
  {
    title: 'dotvim',
    description: 'Modern IDE-grade Vim configuration. LSP, fuzzy finding, git integration, floating terminal.',
    url: 'https://github.com/GauravAgarwalGarg/dotvim',
    tags: ['vim', 'neovim', 'developer-tools', 'productivity'],
    category: 'tools',
  },
  // Learning & Resources
  {
    title: 'CourseHub',
    description: 'Curated free courses, conferences & engineering blogs new_textfrom fundamentals to frontier research.',
    url: 'https://github.com/GauravAgarwalGarg/CourseHub',
    tags: ['education', 'open-source', 'curated', 'engineering'],
    category: 'learning',
  },
  {
    title: 'A Modern C++ Playground',
    description: 'Everything C++ new_textmodern standards (C++11 through C++23), patterns, and idioms.',
    url: 'https://github.com/GauravAgarwalGarg/AModernCppPlayground',
    tags: ['c++', 'modern-cpp', 'learning', 'systems'],
    category: 'learning',
  },
  {
    title: 'Giggle With Python',
    description: 'Complete tutorials and preparation material for Python new_textsnippets, frameworks, and best practices.',
    url: 'https://github.com/GauravAgarwalGarg/GiggleWithPython',
    tags: ['python', 'tutorials', 'learning'],
    category: 'learning',
  },
  {
    title: 'Playground',
    description: 'Multi-language experimental lab new_textC, C++, Python, Java, Go, Rust. Proof of concepts that mature into real projects.',
    url: 'https://github.com/GauravAgarwalGarg/Playground',
    tags: ['polyglot', 'experiments', 'learning'],
    category: 'learning',
  },
  // Finance & Data
  {
    title: 'AngelOne Dashboard',
    description: 'Stock market dashboard with real-time data, screeners, and technical indicators.',
    url: 'https://github.com/GauravAgarwalGarg/AngelOneDashboard',
    tags: ['finance', 'python', 'react', 'real-time'],
    category: 'finance',
  },
  // Creative & Web
  {
    title: 'This Blog',
    description: 'Astro-powered static blog with Islands Architecture, MDX, View Transitions, and zero JS by default.',
    url: 'https://github.com/GauravAgarwalGarg/Blog',
    tags: ['astro', 'blog', 'typescript', 'static-site'],
    category: 'creative',
  },
  {
    title: 'Voyager',
    description: 'Image sharing platform with random facts new_texta creative side project.',
    url: 'https://github.com/GauravAgarwalGarg/voyager',
    tags: ['web', 'images', 'creative'],
    category: 'creative',
  },
];
