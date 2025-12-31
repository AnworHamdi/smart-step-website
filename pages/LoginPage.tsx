
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Icons';
import { useSeo } from '../hooks/useSeo';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  useSeo(t('loginPage.title'), t('loginPage.subtitle'));
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.otpRequired) {
        navigate('/verify-otp');
      } else {
        // For both normal login and mustChangePassword, navigate to the intended destination.
        // The PasswordChangeGuard will intercept and redirect if necessary.
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'unverified') {
        setError(t('loginPage.unverifiedError'));
      } else {
        setError(t('loginPage.errorMessage'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading && !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div className="animate-on-scroll is-visible">
          <Card className="p-10">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-smart-blue">{t('loginPage.title')}</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('loginPage.subtitle')}</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">{t('loginPage.email')}</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-smart-blue focus:border-smart-blue focus:z-10 sm:text-sm"
                    placeholder={t('loginPage.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">{t('loginPage.password')}</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-smart-blue focus:border-smart-blue focus:z-10 sm:text-sm"
                    placeholder={t('loginPage.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-smart-blue hover:text-blue-700 dark:text-soft-blue dark:hover:text-blue-400">
                    {t('loginPage.forgotPassword')}
                  </Link>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 text-center" aria-live="polite">{error}</p>}

              <div>
                <Button type="submit" className="w-full flex justify-center" disabled={isSubmitting}>
                  {isSubmitting && <LoadingSpinner />}
                  {t('loginPage.loginButton')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;