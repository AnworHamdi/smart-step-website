import React, { useContext, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { LanguageContext } from './contexts/LanguageContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageLoader from './components/ui/PageLoader';
import ScrollToTop from './components/layout/ScrollToTop';

// Lazy load all page components for code-splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));

function App() {
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['Super admin', 'admin', 'employee']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
