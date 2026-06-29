export const SITE_TITLE = "Gaurav's Engineering Log";
export const SITE_DESCRIPTION = 'Devices to Cloud software engineering, embedded systems, and everything in between.';
export const SITE_AUTHOR = 'Gaurav Agarwal';
export const SITE_TAGLINE = 'Building from Silicon to Cloud';
export const SITE_BIO = 'Software engineer spanning the full spectrum from bare-metal firmware and kernel drivers to cloud-native distributed systems. Perpetually exploring the boundary between hardware registers and microservices.';

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
  { href: '/talks', label: 'Talks' },
] as const;

export const SOCIAL_LINKS = {
  github: 'https://github.com/GauravAgarwalGarg',
  linkedin: 'https://www.linkedin.com/in/gauravagarwalgarg/',
  twitter: 'https://x.com/gauravaggarg',
  stackoverflow: 'https://stackoverflow.com/users/6194954/gaurav-agarwal-garg',
  leetcode: 'https://leetcode.com/gauravagarwalgarg/',
  rss: '/rss.xml',
} as const;

// Project categories for broader grouping
export type ProjectCategory = 'interview' | 'languages' | 'systems' | 'tools' | 'learning' | 'apps';

export interface Project {
  title: string;
  description: string;
  url: string;
  docs?: string;
  tags: string[];
  category: ProjectCategory;
}

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  interview: '🎯 Interview & DSA',
  languages: '💻 Language Playgrounds',
  systems: '⚙️ Systems & Protocols',
  tools: '🛠️ Developer Tools',
  learning: '🎓 Learning & Reference',
  apps: '🚀 Applications',
};

export const PROJECTS: Project[] = [
  // Interview & DSA
  {
    title: 'Tech Interview OS',
    description: '250+ questions: DSA, LLD, HLD, CI/CD, Architecture with rubrics for SDE 1→4.',
    url: 'https://github.com/GauravAgarwalGarg/tech-interview-os',
    docs: 'https://gauravagarwalgarg.github.io/tech-interview-os/',
    tags: ['dsa', 'system-design', 'interviews', 'architecture'],
    category: 'interview',
  },
  {
    title: 'Playground',
    description: 'Coding interview patterns 101 problems in C++, Python, Go.',
    url: 'https://github.com/GauravAgarwalGarg/Playground',
    docs: 'https://gauravagarwalgarg.github.io/playground/',
    tags: ['algorithms', 'c++', 'python', 'go'],
    category: 'interview',
  },
  // Language Playgrounds
  {
    title: 'Modern C++ Playground',
    description: 'Move semantics, RAII, lock-free, HFT, CRTP, custom allocators 63 compilable files.',
    url: 'https://github.com/GauravAgarwalGarg/modern-cpp-playground',
    docs: 'https://gauravagarwalgarg.github.io/modern-cpp-playground/',
    tags: ['c++', 'modern-cpp', 'performance', 'systems'],
    category: 'languages',
  },
  {
    title: 'Giggle With Python',
    description: 'Python end-to-end: fundamentals, data analytics, frameworks, automation, testing.',
    url: 'https://github.com/GauravAgarwalGarg/giggle-with-python',
    docs: 'https://gauravagarwalgarg.github.io/giggle-with-python/',
    tags: ['python', 'analytics', 'automation', 'testing'],
    category: 'languages',
  },
  {
    title: 'Grin With Golang',
    description: 'The Ultimate Go Playbook: concurrency, GMP scheduler, system design 62 source files.',
    url: 'https://github.com/GauravAgarwalGarg/grin-with-golang',
    docs: 'https://gauravagarwalgarg.github.io/grin-with-golang/',
    tags: ['go', 'concurrency', 'system-design'],
    category: 'languages',
  },
  {
    title: 'PrototypeSTL',
    description: 'High-performance, embedded-friendly C++ standard library alternative.',
    url: 'https://github.com/GauravAgarwalGarg/prototype-stl',
    docs: 'https://gauravagarwalgarg.github.io/prototype-stl/',
    tags: ['c++', 'stl', 'embedded', 'performance'],
    category: 'languages',
  },
  // Systems & Protocols
  {
    title: 'Protocols',
    description: 'Low-latency networking, aerospace (ARINC 429/664), embedded (UART/SPI/CAN), satellite (CCSDS).',
    url: 'https://github.com/GauravAgarwalGarg/protocols',
    docs: 'https://gauravagarwalgarg.github.io/protocols/',
    tags: ['networking', 'aerospace', 'embedded', 'protocols'],
    category: 'systems',
  },
  {
    title: 'Yocto Playground',
    description: 'Embedded Linux build system recipes, layers, QEMU, BSP.',
    url: 'https://github.com/GauravAgarwalGarg/yocto-playground',
    docs: 'https://gauravagarwalgarg.github.io/yocto-playground/',
    tags: ['yocto', 'embedded-linux', 'bsp', 'qemu'],
    category: 'systems',
  },
  {
    title: 'Linux Scripts',
    description: 'Shell scripts for sysadmin, monitoring, automation, containers.',
    url: 'https://github.com/GauravAgarwalGarg/linux-scripts',
    docs: 'https://gauravagarwalgarg.github.io/linux-scripts/',
    tags: ['linux', 'bash', 'automation', 'devops'],
    category: 'systems',
  },
  // Developer Tools
  {
    title: 'void-filter',
    description: 'Enterprise git hooks framework format, lint, secrets scan, AI-fix for all languages.',
    url: 'https://github.com/GauravAgarwalGarg/void-filter',
    docs: 'https://gauravagarwalgarg.github.io/void-filter/',
    tags: ['git-hooks', 'linting', 'security', 'developer-tools'],
    category: 'tools',
  },
  {
    title: 'dotvim',
    description: 'IDE-grade Vim config LSP, fuzzy find, git, 30+ plugins, Google style.',
    url: 'https://github.com/GauravAgarwalGarg/dotvim',
    docs: 'https://gauravagarwalgarg.github.io/dotvim/',
    tags: ['vim', 'neovim', 'developer-tools', 'productivity'],
    category: 'tools',
  },
  // Learning & Reference
  {
    title: 'SW Course Hub',
    description: '500+ free CS courses from MIT, Stanford, CMU, NPTEL organized by career stage.',
    url: 'https://github.com/GauravAgarwalGarg/sw-course-hub',
    docs: 'https://gauravagarwalgarg.github.io/sw-course-hub/',
    tags: ['education', 'courses', 'curated', 'cs'],
    category: 'learning',
  },
  {
    title: 'Autonomy Loops',
    description: 'Loop Engineering Library control systems and autonomy patterns.',
    url: 'https://github.com/GauravAgarwalGarg/autonomy-loops',
    docs: 'https://gauravagarwalgarg.github.io/autonomy-loops/',
    tags: ['control-systems', 'autonomy', 'engineering'],
    category: 'learning',
  },
  // Applications
  {
    title: 'AngelOne Dashboard',
    description: 'Stock trading dashboard FastAPI backend + React frontend.',
    url: 'https://github.com/GauravAgarwalGarg/angel-one-dashboard',
    tags: ['finance', 'fastapi', 'react', 'real-time'],
    category: 'apps',
  },
  {
    title: 'This Blog',
    description: 'Astro-powered static blog Islands Architecture, MDX, View Transitions, zero JS by default.',
    url: 'https://github.com/GauravAgarwalGarg/Blog',
    tags: ['astro', 'blog', 'typescript', 'static-site'],
    category: 'apps',
  },
];
