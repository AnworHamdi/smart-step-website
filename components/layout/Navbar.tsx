
import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import SmartStepLogo from '../ui/SmartStepLogo';
import { LanguageContext } from '../../contexts/LanguageContext';
import { DataContext } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { MenuIcon, XIcon } from '../ui/Icons';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useContext(LanguageContext);
  const { siteInfo } = useContext(DataContext);
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `py-2 px-3 rounded-lg transition-all duration-300 text-sm font-semibold w-full text-center lg:w-auto ${isActive ? 'bg-blue-100 dark:bg-gray-700 text-smart-blue dark:text-gray-100 shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-smart-blue'
    }`;

  const navLinks = [
    { to: '/', text: t('nav.home') },
    { to: '/about', text: t('nav.about') },
    { to: '/services', text: t('nav.services') },
    { to: '/blog', text: t('nav.blog') },
    ...(isAuthenticated
      ? [{ to: '/dashboard', text: t('nav.dashboard') }]
      : [{ to: '/contact', text: t('nav.contact') }]),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-sm dark:shadow-none border-b border-gray-100 dark:border-zinc-800 transition-colors duration-300">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <NavLink to="/">
            <SmartStepLogo logoUrl={siteInfo.logoUrl} />
          </NavLink>
          <div className="hidden lg:flex items-center space-x-2 rtl:space-x-reverse">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {link.text}
              </NavLink>
            ))}
          </div>
          <div className="hidden lg:flex items-center space-x-2 rtl:space-x-reverse">
            {isAuthenticated ? (
              <button onClick={logout} className="py-2 px-4 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-sm">
                {t('nav.logout')}
              </button>
            ) : (
              <NavLink to="/login" className="py-2 px-4 rounded-lg bg-smart-green text-white text-sm font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-sm !text-white">
                {t('nav.login')}
              </NavLink>
            )}
            <button
              onClick={toggleLanguage}
              className="py-2 px-4 rounded-lg bg-smart-blue text-white text-sm font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-sm"
            >
              {t('nav.language')}
            </button>
          </div>
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 dark:text-gray-300 focus:outline-none"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div id="mobile-menu" className="lg:hidden mt-4 flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} className={navLinkClass} onClick={() => setIsOpen(false)}>
                {link.text}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button onClick={() => { logout(); setIsOpen(false); }} className="w-full py-2 px-4 rounded-lg bg-red-500 text-white text-sm font-semibold">
                {t('nav.logout')}
              </button>
            ) : (
              <NavLink to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-2 px-4 rounded-lg bg-smart-green text-white text-sm font-semibold !text-white">
                {t('nav.login')}
              </NavLink>
            )}
            <button
              onClick={() => { toggleLanguage(); setIsOpen(false); }}
              className="w-full py-2 px-4 rounded-lg bg-smart-blue text-white text-sm font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-sm"
            >
              {t('nav.language')}
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
