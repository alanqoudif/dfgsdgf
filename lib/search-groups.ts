import { Globe, Mountain, Search, GraduationCap, Youtube, Twitter, ChartBar, MessageCircle } from "lucide-react";

export type SearchGroupId = 'web' | 'extreme' | 'academic' | 'youtube' | 'x' | 'analysis' | 'buddy' | 'chat';

export interface SearchGroup {
  id: SearchGroupId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  shortDescription?: string;
  show: boolean;
}

export const searchGroups: SearchGroup[] = [
  {
    id: 'web',
    name: 'البحث العادي',
    icon: Globe,
    description: 'بحث عام على الإنترنت',
    shortDescription: 'عام',
    show: true
  },
  {
    id: 'extreme',
    name: 'البحث المتقدم',
    icon: Mountain,
    description: 'بحث متقدم للمعلومات المتخصصة',
    shortDescription: 'متقدم',
    show: true
  },
  {
    id: 'academic',
    name: 'البحث الأكاديمي',
    icon: GraduationCap,
    description: 'بحث المصادر الأكاديمية والعلمية',
    shortDescription: 'أكاديمي',
    show: true
  },
  {
    id: 'youtube',
    name: 'بحث يوتيوب',
    icon: Youtube,
    description: 'بحث مقاطع فيديو يوتيوب',
    shortDescription: 'يوتيوب',
    show: true
  },
  {
    id: 'x',
    name: 'بحث تويتر',
    icon: Twitter,
    description: 'بحث التغريدات على منصة إكس (تويتر)',
    shortDescription: 'تويتر',
    show: true
  },
  {
    id: 'analysis',
    name: 'تحليل البيانات',
    icon: ChartBar,
    description: 'تحليل ومعالجة البيانات والمخططات',
    shortDescription: 'تحليل',
    show: true
  },
  {
    id: 'buddy',
    name: 'المساعد الافتراضي',
    icon: MessageCircle,
    description: 'مساعد افتراضي للمحادثة والدردشة',
    shortDescription: 'مساعد',
    show: false
  },
  {
    id: 'chat',
    name: 'الدردشة',
    icon: MessageCircle,
    description: 'محادثة مباشرة',
    shortDescription: 'دردشة',
    show: false
  }
];

export function getSearchGroupById(id: SearchGroupId): SearchGroup {
  return searchGroups.find(group => group.id === id) || searchGroups[0];
} 