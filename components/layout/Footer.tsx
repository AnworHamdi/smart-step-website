
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import SmartStepLogo from '../ui/SmartStepLogo';
import { DataContext } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Skeleton from '../ui/Skeleton';

const FacebookIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" aria-hidden="true" focusable="false"><title>Facebook</title><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
const LinkedInIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" aria-hidden="true" focusable="false"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>;

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { siteInfo, loading } = useContext(DataContext);
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('footer.newsletter.invalidEmail'));
      return;
    }

    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 5000); // Reset success message after 5s
    }, 1500);
  };


  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-smart-blue to-soft-blue text-white p-8 rounded-xl text-center mb-12 shadow-lg">
            <h3 className="text-2xl font-bold mb-2">{t('footer.newsletter.title')}</h3>
            <p className="mb-6 max-w-md mx-auto opacity-90">{t('footer.newsletter.subtitle')}</p>
            {success ? (
              <p className="font-semibold text-lg animate-pulse">{t('footer.newsletter.success')}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label htmlFor="newsletter-email" className="sr-only">
                    {t('footer.newsletter.placeholder')}
                  </label>
                  <input
                    type="email"
                    id="newsletter-email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder={t('footer.newsletter.placeholder')}
                    className="w-full px-4 py-3 rounded-lg text-gray-800 dark:text-gray-100 bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-smart-blue transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="w-full sm:w-auto bg-smart-green hover:bg-opacity-90 transition-all duration-300 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider disabled:bg-opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    {subscribing ? t('footer.newsletter.subscribing') : t('footer.newsletter.subscribe')}
                  </button>
                </div>
                {error && <p className="text-red-300 text-sm mt-2" role="alert">{error}</p>}
              </form>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-1">
            <SmartStepLogo logoUrl={siteInfo.logoUrl} />
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-base">{t('footer.description')}</p>
            <div className="flex space-x-4 rtl:space-x-reverse mt-6">
              <a href="#" aria-label="Facebook" className="text-gray-400 dark:text-gray-500 hover:text-smart-blue transition-colors"><FacebookIcon /></a>
              <a href="#" aria-label="LinkedIn" className="text-gray-400 dark:text-gray-500 hover:text-smart-blue transition-colors"><LinkedInIcon /></a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('footer.links')}</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-smart-blue transition-colors text-base">{t('nav.home')}</Link></li>
              <li><Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-smart-blue transition-colors text-base">{t('nav.about')}</Link></li>
              <li><Link to="/services" className="text-gray-500 dark:text-gray-400 hover:text-smart-blue transition-colors text-base">{t('nav.services')}</Link></li>
              <li><Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-smart-blue transition-colors text-base">{t('nav.contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('footer.legal')}</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-smart-blue transition-colors text-base">{t('footer.privacy')}</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-smart-blue transition-colors text-base">{t('footer.terms')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('nav.contact')}</h3>
            {loading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <ul className="mt-4 space-y-2 text-base text-gray-500 dark:text-gray-400">
                <li>{t(siteInfo.address)}</li>
                {siteInfo.phone && (
                  <li>
                    <span dir="ltr">{siteInfo.phone}</span>
                  </li>
                )}
                <li>{siteInfo.email}</li>
              </ul>
            )}
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-zinc-800 text-center text-sm text-gray-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
