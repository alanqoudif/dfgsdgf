export interface Page {
  id: string;
  title: string;
  description: string;
  href: string;
  image?: string;
  status?: 'soon' | 'beta' | 'new';
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  pages: Page[];
}

// Page data for various sections of the application
export const pagesData: Page[] = [
  {
    id: 'chat',
    title: 'الدردشة',
    description: 'تحدث مع الذكاء الاصطناعي وطرح الأسئلة',
    href: '/',
    image: '/images/chat.png',
  },
  {
    id: 'about',
    title: 'عن التطبيق',
    description: 'معلومات عن التطبيق وكيفية استخدامه',
    href: '/about',
    image: '/images/about.png',
  },
  {
    id: 'dashboard',
    title: 'لوحة التحكم',
    description: 'إدارة حسابك وإعداداتك',
    href: '/dashboard',
    image: '/images/dashboard.png',
    status: 'soon',
  },
];

// Collections of related pages
export const collections: Collection[] = [
  {
    id: 'main',
    title: 'الرئيسية',
    description: 'الصفحات الأساسية في التطبيق',
    pages: pagesData.filter(page => ['chat', 'about'].includes(page.id)),
  },
  {
    id: 'user',
    title: 'المستخدم',
    description: 'صفحات خاصة بالمستخدم',
    pages: pagesData.filter(page => ['dashboard'].includes(page.id)),
  },
];

// Function to get all collections
export function getCollections(): Collection[] {
  return collections;
}

// Function to get a specific page by ID
export function getPageById(id: string): Page | undefined {
  return pagesData.find(page => page.id === id);
}

// Function to get a specific collection by ID
export function getCollectionById(id: string): Collection | undefined {
  return collections.find(collection => collection.id === id);
} 