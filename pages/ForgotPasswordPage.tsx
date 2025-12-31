


import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useSeo } from '../hooks/useSeo';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  useSeo(t('forgotPasswordPage.title'), t('forgotPasswordPage.subtitle'));
  const navigate = useNavigate();
  const { initiatePasswordReset } = useAuth();


  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError(t('contact.validation.required'));
      return;
    }

    setIsSubmitting(true);
    
    const userExists = await initiatePasswordReset(email);
      
    if (userExists) {
      // User exists, email was shown, now navigate
      navigate('/reset-password');
    } else {
      // For security, show a generic success message even if the email doesn't exist
      // to prevent email enumeration attacks.
      setIsSubmitted(true);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-10 animate-on-scroll is-visible">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-smart-blue">{t('forgotPasswordPage.title')}</h1>
            <p className="mt-2 text-sm text-gray-600">{t('forgotPasswordPage.subtitle')}</p>
          </div>
          {isSubmitted ? (
            <div className="mt-8 text-center">
              <p className="text-green-700 bg-green-100 p-4 rounded-lg">{t('forgotPasswordPage.successMessage')}</p>
              <Link to="/login" className="font-medium text-smart-blue hover:text-blue-700 mt-4 block">
                {t('forgotPasswordPage.backToLogin')}
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="sr-only">{t('forgotPasswordPage.email')}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-smart-blue focus:border-smart-blue focus:z-10 sm:text-sm"
                  placeholder={t('loginPage.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              {error && <p className="text-sm text-red-600 text-center" role="alert">{error}</p>}

              <div>
                <Button type="submit" className="w-full flex justify-center" disabled={isSubmitting}>
                  {isSubmitting && <LoadingSpinner className="h-5 w-5 text-white" />}
                  {isSubmitting ? t('forgotPasswordPage.sending') : t('forgotPasswordPage.sendCode')}
                </Button>
              </div>
              <div className="text-sm text-center">
                  <Link to="/login" className="font-medium text-gray-600 hover:text-smart-blue">
                    {t('forgotPasswordPage.backToLogin')}
                  </Link>
                </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;