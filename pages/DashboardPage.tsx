import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ManagePosts from '../components/dashboard/ManagePosts';
import ManageUsers from '../components/dashboard/ManageUsers';
import SiteSettings from '../components/dashboard/SiteSettings';
import ManageTeam from '../components/dashboard/ManageTeam';
import ManageMessages from '../components/dashboard/ManageMessages';
import ManageSubscriptions from '../components/dashboard/ManageSubscriptions';
import ManageMedia from '../components/dashboard/ManageMedia';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('posts');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'posts':
        return <ManagePosts />;
      case 'media':
        return <ManageMedia />;
      case 'messages':
        return <ManageMessages />;
      case 'subscriptions':
        return <ManageSubscriptions />;
      case 'users':
        return <ManageUsers />;
      case 'team':
        return <ManageTeam />;
      case 'settings':
        return <SiteSettings />;
      default:
        return <ManagePosts />;
    }
  };

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      posts: t('dashboard.tabs.posts'),
      media: t('dashboard.tabs.media'),
      messages: t('dashboard.tabs.messages'),
      subscriptions: t('dashboard.tabs.subscriptions') || 'Subscriptions',
      users: t('dashboard.tabs.users'),
      team: t('dashboard.tabs.team'),
      settings: t('dashboard.tabs.settings'),
    };
    return titles[activeSection] || titles.posts;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {getSectionTitle()}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('dashboardPage.welcome')} {user?.email}
            </p>
          </div>

          {/* Active Section Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
