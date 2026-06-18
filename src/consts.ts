export const SITE_TITLE = "Gaurav's Engineering Log";
export const SITE_DESCRIPTION = 'Devices to Cloud ftware engineering, embedded systems, machine learning, and the occasional poem.';
export const SITE_AUTHOR = 'Gaurav Agarwal';
export const SITE_TAGLINE = 'Building from Silicon to Cloud';
export const SITE_BIO = 'Gaurav Agarwal is a software engineer with expertise spanning embedded systems, cloud infrastructure, and machine learning. From bare-metal firmware to distributed systems, bridging the gap between hardware and software.';

// Ordered categories
export const CATEGORIES = [
  'software-engineering',
  'embedded-systems',
  'machine-learning',
  'computer-science',
  'python',
  'electronics',
  'tech-tips',
  'personal-finance',
  'aerospace',
  'infrastructure',
  'history',
  'culinary',
  'reviews',
  'poems',
  'micro',
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  'software-engineering': 'Software Engineering',
  'embedded-systems': 'Embedded Systems',
  'machine-learning': 'Machine Learning',
  'computer-science': 'Computer Science',
  'python': 'Python',
  'electronics': 'Electronics',
  'tech-tips': 'Tech Tips',
  'personal-finance': 'Personal Finance',
  'aerospace': 'Aerospace',
  'infrastructure': 'Infrastructure',
  'history': 'History',
  'culinary': 'Culinary',
  'reviews': 'Reviews',
  'poems': 'Poems',
  'micro': 'Micro',
};

export const CATEGORY_DESCRIPTIONS: Partial<Record<Category, string>> = {
  'software-engineering': 'System design, distributed systems, and software architecture patterns.',
  'embedded-systems': 'Bare-metal programming, RTOS, STM32, ARM, and firmware development.',
  'machine-learning': 'Deep learning, neural networks, transformers, and ML infrastructure.',
  'computer-science': 'Algorithms, data structures, compilers, and CS fundamentals.',
  'python': 'Python internals, frameworks, performance, and best practices.',
  'electronics': 'Circuit design, PCBs, signal processing, and hardware hacking.',
  'infrastructure': 'Linux, kernel, DevOps, containers, and cloud infrastructure.',
  'aerospace': 'DO-178C, avionics, safety-critical systems, and flight software.',
};

export const CATEGORY_ICONS: Partial<Record<Category, string>> = {
  'software-engineering': 'SE',
  'embedded-systems': 'EM',
  'machine-learning': 'ML',
  'computer-science': 'CS',
  'python': 'PY',
  'electronics': 'EL',
  'infrastructure': 'IF',
  'aerospace': 'AE',
};

export const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/posts', label: 'Articles' },
  { href: '/concepts', label: 'Concepts' },
  { href: '/projects', label: 'Projects' },
  { href: '/posts/category/embedded-systems', label: 'Embedded' },
  { href: '/posts/category/machine-learning', label: 'ML' },
] as const;

export const SOCIAL_LINKS = {
  github: 'https://github.com/GauravAgarwalGarg',
  linkedin: 'https://www.linkedin.com/in/gauravagarwalgarg/',
  twitter: 'https://x.com/gauravaggarg',
  rss: '/rss.xml',
} as const;

// Work experience for homepage sidebar
export interface WorkEntry {
  company: string;
  role: string;
  period: string;
  logo?: string;
}

export const WORK_EXPERIENCE: WorkEntry[] = [
  {
    company: 'Current Company',
    role: 'Software Engineer',
    period: '2022 esent',
  },
  {
    company: 'Previous Company',
    role: 'Embedded Software Engineer',
    period: '2020 22',
  },
];

// Bookmarks for homepage sidebar
export interface Bookmark {
  title: string;
  author: string;
  url?: string;
}

export const BOOKMARKS: Bookmark[] = [
  {
    title: 'Making Embedded Systems',
    author: 'Elecia White',
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
  },
  {
    title: 'The Attention Mechanism Paper',
    author: 'Vaswani et al.',
  },
];

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
  {
    title: 'CourseHub',
    description: 'Curated free courses, conferences & engineering blogs om fundamentals to frontier research.',
    url: 'https://github.com/GauravAgarwalGarg/CourseHub',
    tags: ['education', 'open-source', 'curated', 'engineering'],
    category: 'learning',
  },
  {
    title: 'A Modern C++ Playground',
    description: 'Everything C++ dern standards (C++11 through C++23), patterns, and idioms.',
    url: 'https://github.com/GauravAgarwalGarg/AModernCppPlayground',
    tags: ['c++', 'modern-cpp', 'learning', 'systems'],
    category: 'learning',
  },
  {
    title: 'Giggle With Python',
    description: 'Complete tutorials and preparation material for Python ippets, frameworks, and best practices.',
    url: 'https://github.com/GauravAgarwalGarg/GiggleWithPython',
    tags: ['python', 'tutorials', 'learning'],
    category: 'learning',
  },
  {
    title: 'Playground',
    description: 'Multi-language experimental lab  C++, Python, Java, Go, Rust. Proof of concepts that mature into real projects.',
    url: 'https://github.com/GauravAgarwalGarg/Playground',
    tags: ['polyglot', 'experiments', 'learning'],
    category: 'learning',
  },
  {
    title: 'AngelOne Dashboard',
    description: 'Stock market dashboard with real-time data, screeners, and technical indicators.',
    url: 'https://github.com/GauravAgarwalGarg/AngelOneDashboard',
    tags: ['finance', 'python', 'react', 'real-time'],
    category: 'finance',
  },
  {
    title: 'This Blog',
    description: 'Astro-powered static blog with Islands Architecture, MDX, View Transitions, and zero JS by default.',
    url: 'https://github.com/GauravAgarwalGarg/Blog',
    tags: ['astro', 'blog', 'typescript', 'static-site'],
    category: 'creative',
  },
  {
    title: 'Voyager',
    description: 'Image sharing platform with random facts creative side project.',
    url: 'https://github.com/GauravAgarwalGarg/voyager',
    tags: ['web', 'images', 'creative'],
    category: 'creative',
  },
];
