import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { DataContext } from '../contexts/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { LoadingSpinner, CheckIcon } from '../components/ui/Icons';
import { useSeo } from '../hooks/useSeo';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  useSeo(t('verifyEmailPage.title'), '');
  const { verifyUser } = useContext(DataContext);
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const performVerification = async () => {
      if (token) {
        const success = await verifyUser(token);
        setStatus(success ? 'success' : 'error');
      } else {
        setStatus('error');
      }
    };
    performVerification();
  }, [token, verifyUser]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <div className="flex justify-center mb-4">
              <LoadingSpinner className="ni-3x" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{t('verifyEmailPage.title')}</h1>
            <p className="mt-2 text-gray-600">{t('verifyEmailPage.verifying')}</p>
          </>
        );
      case 'success':
        return (
          <>
            <div className="flex justify-center mb-4">
              <div className="bg-smart-green rounded-full h-16 w-16 flex items-center justify-center">
                <CheckIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{t('verifyEmailPage.successTitle')}</h1>
            <p className="mt-2 text-gray-600">{t('verifyEmailPage.successMessage')}</p>
            <div className="mt-6">
              <Button to="/login">{t('verifyEmailPage.backToLogin')}</Button>
            </div>
          </>
        );
      case 'error':
        return (
          <>
             <h1 className="text-2xl font-bold text-red-600">{t('verifyEmailPage.errorTitle')}</h1>
            <p className="mt-2 text-gray-600">{t('verifyEmailPage.errorMessage')}</p>
            <div className="mt-6">
              <Button to="/login">{t('verifyEmailPage.backToLogin')}</Button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 py-12 px-4">
      <Card className="p-10 max-w-md w-full text-center animate-on-scroll is-visible">
        {renderContent()}
      </Card>
    </div>
  );
};

export default VerifyEmailPage;