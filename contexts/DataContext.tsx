import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Post, User, SiteInfo, TeamMember } from '../types';
import {
  listItems, createItem, updateItem, deleteItem,
  listUsers, createUser, updateUser, deleteUser,
  getSettings, updateSettings
} from '../lib/apiClient';

interface DataContextType {
  posts: Post[];
  users: User[];
  siteInfo: SiteInfo;
  teamMembers: TeamMember[];
  loading: boolean;
  addPost: (post: Omit<Post, 'id' | 'date' | 'author'>, author: string) => Promise<void>;
  updatePost: (post: Post) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'verified'>) => Promise<string | null>;
  updateUserData: (user: User) => Promise<void>;
  deleteUserData: (id: string) => Promise<void>;
  updateSiteInfo: (newInfo: SiteInfo) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (id: string) => void;
  refreshPosts: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const DataContext = createContext<DataContextType>(null!);

// Default empty site info
const defaultSiteInfo: SiteInfo = {
  address: { ar: '', en: '' },
  phone: '',
  email: '',
  logoUrl: '',
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(defaultSiteInfo);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Map CMS item to Post format
  const mapItemToPost = (item: any): Post => {
    const attrs = item.attributes || item;
    return {
      id: String(item.id || attrs.id),
      title: { ar: attrs.name || '', en: attrs.name || '' },
      excerpt: { ar: attrs.excerpt || '', en: attrs.excerpt || '' },
      content: { ar: attrs.description || '', en: attrs.description || '' },
      imageUrl: attrs.image || '',
      author: attrs.user?.name || 'Admin',
      date: attrs.date_at || attrs.created_at || new Date().toISOString(),
      status: attrs.status === 'published' ? 'published' : 'draft',
    };
  };

  // Map CMS user to User format
  const mapApiUser = (u: any): User => {
    const attrs = u.attributes || u;
    const roles: string[] = attrs.roles?.map((r: any) => typeof r === 'string' ? r : r.name) || [];
    // Map CMS roles to frontend roles: admin stays admin, creator/member become employee
    let role: User['role'] = 'employee';
    if (roles.includes('Super admin')) {
      role = 'Super admin';
    } else if (roles.includes('admin')) {
      role = 'admin';
    }
    return {
      id: String(u.id || attrs.id),
      email: attrs.email,
      name: attrs.name,
      role,
      verified: true,
    };
  };


  // Fetch posts from API
  const refreshPosts = async () => {
    try {
      const response = await listItems({ include: 'user,category,tags' });
      const items = response.data || response;
      if (Array.isArray(items)) {
        setPosts(items.map(mapItemToPost));
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  // Fetch users from API
  const refreshUsers = async () => {
    try {
      const response = await listUsers();
      const userList = response.data || response;
      if (Array.isArray(userList)) {
        setUsers(userList.map(mapApiUser));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Fetch site settings from API
  const refreshSettings = async () => {
    try {
      const response = await getSettings();
      const settings = response.data || {};
      setSiteInfo({
        address: settings.contact_address?.value || { ar: '', en: '' },
        phone: settings.contact_phone?.value || '',
        email: settings.contact_email?.value || '',
        logoUrl: settings.site_logo?.value || '',
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        refreshPosts(),
        refreshUsers(),
        refreshSettings(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const addPost = async (postData: Omit<Post, 'id' | 'date' | 'author'>, author: string) => {
    try {
      const payload = {
        name: postData.title.en,
        excerpt: postData.excerpt.en,
        description: postData.content.en,
        image: postData.imageUrl,
        status: postData.status,
        is_on_homepage: false,
        date_at: new Date().toISOString().split('T')[0],
      };
      await createItem(payload);
      await refreshPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  };

  const updatePost = async (updatedPost: Post) => {
    try {
      await updateItem(updatedPost.id, {
        name: updatedPost.title.en,
        excerpt: updatedPost.excerpt.en,
        description: updatedPost.content.en,
        image: updatedPost.imageUrl,
        status: updatedPost.status,
      });
      setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  };

  const deletePostHandler = async (id: string) => {
    try {
      await deleteItem(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'verified'>): Promise<string | null> => {
    try {
      await createUser({
        name: userData.name || userData.email.split('@')[0],
        email: userData.email,
        password: userData.password || 'ChangeMe123!',
      });
      await refreshUsers();
      return null;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  const updateUserData = async (updatedUser: User) => {
    try {
      await updateUser(updatedUser.id, {
        name: updatedUser.name,
        email: updatedUser.email,
      });
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const deleteUserData = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  };

  const updateSiteInfo = async (newInfo: SiteInfo) => {
    try {
      await updateSettings([
        { key: 'contact_address', value: newInfo.address, group: 'contact' },
        { key: 'contact_phone', value: newInfo.phone, group: 'contact' },
        { key: 'contact_email', value: newInfo.email, group: 'contact' },
        { key: 'site_logo', value: newInfo.logoUrl, group: 'general' },
      ]);
      setSiteInfo(newInfo);
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Still update locally for optimistic UI
      setSiteInfo(newInfo);
    }
  };

  // Team members are stored locally for now
  const addTeamMember = (memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: Date.now().toString(),
    };
    setTeamMembers(prev => [...prev, newMember]);
  };

  const updateTeamMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <DataContext.Provider value={{
      posts, users, siteInfo, teamMembers, loading,
      addPost, updatePost, deletePost: deletePostHandler,
      addUser, updateUserData, deleteUserData,
      updateSiteInfo,
      addTeamMember, updateTeamMember, deleteTeamMember,
      refreshPosts, refreshUsers,
    }}>
      {children}
    </DataContext.Provider>
  );
};