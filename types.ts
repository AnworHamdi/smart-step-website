
export type Language = 'ar' | 'en';

export interface TranslationObject {
  ar: string;
  en: string;
}

export interface Post {
  id: string;
  title: TranslationObject;
  excerpt: TranslationObject;
  content: TranslationObject;
  imageUrl: string;
  author: string;
  date: string;
  status: 'published' | 'draft';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'Super admin' | 'admin' | 'employee';
  password?: string;
  verified?: boolean;
  mustChangePassword?: boolean;
}

export interface SiteInfo {
  address: TranslationObject;
  phone: string;
  email: string;
  logoUrl?: string;
}

export interface TeamMember {
  id: string;
  name: TranslationObject;
  role: TranslationObject;
  imageUrl: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  reply_message?: string | null;
  replied_by?: number | null;
  replied_at?: string | null;
  created_at: string;
  updated_at: string;
}


export interface EmailSubscription {
  id: number;
  email: string;
  name?: string | null;
  status: 'active' | 'unsubscribed';
  source?: string | null;
  subscribed_at: string;
  unsubscribed_at?: string | null;
  created_at: string;
  updated_at: string;
}