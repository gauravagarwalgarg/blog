export const SITE_TITLE = "Articles & Blog";
export const SITE_DESCRIPTION = 'Explore a blend of cutting-edge technology, product design, and engineering, paired with personal growth insights into wellness, finance, and creativity. From systems building to history, culinary arts, and poetry.';
export const SITE_AUTHOR = 'Gaurav Agarwal';
export const SITE_TAGLINE = 'Building from Silicon to Cloud';
export const SITE_BIO = 'Explore a blend of cutting-edge technology, product design, and engineering, paired with personal growth insights into wellness, finance, and creativity. From systems building from scratch to history, culinary arts, and poetry discover practical real-world insights and mindful perspectives.';

// Ordered categories
export const CATEGORIES = [
  'software-engineering',
  'embedded-systems',
  'machine-learning',
  'computer-science',
  'programming-languages',
  'electronics',
  'product-management',
  'developer-wellness',
  'spirituality',
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
  'programming-languages': 'Programming Languages',
  'electronics': 'Electronics',
  'product-management': 'Product Management & Design',
  'developer-wellness': 'Developer Wellness',
  'spirituality': 'Spirituality & Flow',
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
  'programming-languages': 'C++, Python, Go, Rust, Java internals, idioms, and performance.',
  'electronics': 'Circuit design, PCBs, signal processing, and hardware hacking.',
  'product-management': 'Engineering roadmaps, technical debt quantification, and shipping decisions.',
  'developer-wellness': 'Systematic burnout prevention, cognitive load management, and sustainable productivity.',
  'spirituality': 'Flow states, Advaita frameworks, and the psychology of deep work.',
  'infrastructure': 'Linux, kernel, DevOps, containers, and cloud infrastructure.',
  'aerospace': 'DO-178C, avionics, safety-critical systems, and flight software.',
};

export const CATEGORY_ICONS: Partial<Record<Category, string>> = {
  'software-engineering': 'SE',
  'embedded-systems': 'EM',
  'machine-learning': 'ML',
  'computer-science': 'CS',
  'programming-languages': 'PL',
  'electronics': 'EL',
  'product-management': 'PM',
  'developer-wellness': 'DW',
  'spirituality': 'SP',
  'infrastructure': 'IF',
  'aerospace': 'AE',
};

export const NAV_LINKS = [
  { href: '/posts', label: 'Articles' },
  { href: '/concepts', label: 'Concepts' },
  { href: '/projects', label: 'Projects' },
  { href: '/essays', label: 'Essays' },
  { href: '/summary', label: 'Summary' },
  { href: '/about', label: 'About' },
] as const;

export const SOCIAL_LINKS = {
  github: 'https://github.com/gauravagarwalgarg',
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
    description: 'A standardized interviewer evaluation framework and question bank for fair, objective hiring across engineering teams.',
    url: 'https://github.com/gauravagarwalgarg/tech-interview-os',
    docs: 'https://gauravagarwalgarg.github.io/tech-interview-os/',
    tags: ['dsa', 'system-design', 'interviews', 'architecture'],
    category: 'interview',
  },
  {
    title: 'Playground',
    description: 'Coding interview patterns multi-language practice (C++, Python, Go) with documented solutions.',
    url: 'https://github.com/gauravagarwalgarg/playground',
    docs: 'https://gauravagarwalgarg.github.io/playground/',
    tags: ['algorithms', 'c++', 'python', 'go'],
    category: 'interview',
  },
  // Language Playgrounds
  {
    title: 'Modern C++ Playground',
    description: 'Move semantics, RAII, lock-free, HFT patterns, CRTP, custom allocators compilable reference files.',
    url: 'https://github.com/gauravagarwalgarg/modern-cpp-playground',
    docs: 'https://gauravagarwalgarg.github.io/modern-cpp-playground/',
    tags: ['c++', 'modern-cpp', 'performance', 'systems'],
    category: 'languages',
  },
  {
    title: 'Giggle With Python',
    description: 'Complete tutorials and preparation material for Python fundamentals, data analytics, frameworks, automation.',
    url: 'https://github.com/gauravagarwalgarg/giggle-with-python',
    docs: 'https://gauravagarwalgarg.github.io/giggle-with-python/',
    tags: ['python', 'analytics', 'automation', 'testing'],
    category: 'languages',
  },
  {
    title: 'Grin With Golang',
    description: 'Beginner to advanced Go concurrency, GMP scheduler, system design, backend development.',
    url: 'https://github.com/gauravagarwalgarg/grin-with-golang',
    docs: 'https://gauravagarwalgarg.github.io/grin-with-golang/',
    tags: ['go', 'concurrency', 'system-design', 'backend'],
    category: 'languages',
  },
  {
    title: 'PrototypeSTL',
    description: 'Low-latency, memory-safe C++ template library optimized for protocol parsing and deterministic real-time systems.',
    url: 'https://github.com/gauravagarwalgarg/prototype-stl',
    docs: 'https://gauravagarwalgarg.github.io/prototype-stl/',
    tags: ['c++', 'stl', 'embedded', 'low-latency'],
    category: 'languages',
  },
  // Systems & Protocols
  {
    title: 'Protocols',
    description: 'Reference materials and code for networking protocols aerospace (ARINC 429/664), embedded (UART/SPI/CAN), satellite (CCSDS).',
    url: 'https://github.com/gauravagarwalgarg/protocols',
    docs: 'https://gauravagarwalgarg.github.io/protocols/',
    tags: ['networking', 'aerospace', 'embedded', 'protocols'],
    category: 'systems',
  },
  {
    title: 'Yocto Playground',
    description: 'Yocto Project meta-layer custom recipes, machine configurations, QEMU targets, BSP bring-up.',
    url: 'https://github.com/gauravagarwalgarg/yocto-playground',
    docs: 'https://gauravagarwalgarg.github.io/yocto-playground/',
    tags: ['yocto', 'embedded-linux', 'bsp', 'bitbake'],
    category: 'systems',
  },
  {
    title: 'Linux Scripts',
    description: 'Post-install scripts for setting up Ubuntu PC environments modular, idempotent, role-based.',
    url: 'https://github.com/gauravagarwalgarg/linux-scripts',
    docs: 'https://gauravagarwalgarg.github.io/linux-scripts/',
    tags: ['linux', 'bash', 'automation', 'devops'],
    category: 'systems',
  },
  {
    title: 'Traffic Simulation',
    description: 'Traffic model simulation agent-based vehicle flow analysis and visualization.',
    url: 'https://github.com/gauravagarwalgarg/traffic-simulation',
    tags: ['simulation', 'modeling', 'python', 'visualization'],
    category: 'systems',
  },
  // Developer Tools
  {
    title: 'void-filter',
    description: 'Centralized client-side Git hooks format, lint, secrets scan, commit standards enforcement.',
    url: 'https://github.com/gauravagarwalgarg/void-filter',
    docs: 'https://gauravagarwalgarg.github.io/void-filter/',
    tags: ['git-hooks', 'linting', 'security', 'developer-tools'],
    category: 'tools',
  },
  {
    title: 'Resume/CV LaTeX',
    description: 'LaTeX templates for resume, CV, and cover letter clean, ATS-friendly, version-controlled.',
    url: 'https://github.com/gauravagarwalgarg/resume-cv-coverletter-tex',
    tags: ['latex', 'resume', 'templates', 'career'],
    category: 'tools',
  },
  // Learning & Reference
  {
    title: 'SW Course Hub',
    description: 'Collection of learnings from courses across domains curated free CS courses from MIT, Stanford, CMU, NPTEL.',
    url: 'https://github.com/gauravagarwalgarg/sw-course-hub',
    docs: 'https://gauravagarwalgarg.github.io/sw-course-hub/',
    tags: ['education', 'courses', 'curated', 'cs'],
    category: 'learning',
  },
  // Applications
  {
    title: 'AngelOne Dashboard',
    description: 'Analysis-only market workspace Angel One SmartAPI historical data and market feeds. No trade execution.',
    url: 'https://github.com/gauravagarwalgarg/angel-one-dashboard',
    tags: ['finance', 'fastapi', 'react', 'market-data'],
    category: 'apps',
  },
  {
    title: 'Vows Profile',
    description: 'Marriage biodata generator create, customize, and download professional matrimonial resumes in PDF.',
    url: 'https://github.com/gauravagarwalgarg/vows-profile',
    docs: 'https://gauravagarwalgarg.github.io/vows-profile/',
    tags: ['web', 'pdf', 'generator', 'react'],
    category: 'apps',
  },
  {
    title: 'This Blog',
    description: 'Astro-powered static blog Islands Architecture, MDX, View Transitions, zero JS by default.',
    url: 'https://github.com/gauravagarwalgarg/blog',
    tags: ['astro', 'blog', 'typescript', 'static-site'],
    category: 'apps',
  },
];
