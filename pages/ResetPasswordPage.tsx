import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { LoadingSpinner, CheckIcon } from '../components/ui/Icons';
import { DataContext } from '../contexts/DataContext';
import { useSeo } from '../hooks/useSeo';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  useSeo(t('resetPasswordPage.title'), t('resetPasswordPage.otpSubtitle'));
  const navigate = useNavigate();
  const { updateUserPassword } = useContext(DataContext);
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const resetInfoRaw = sessionStorage.getItem('passwordReset');
    if (!resetInfoRaw) {
      navigate('/forgot-password');
      return;
    }
    const resetInfo = JSON.parse(resetInfoRaw);
    if (new Date().getTime() > resetInfo.expiry) {
        setError(t('resetPasswordPage.otpExpired'));
        sessionStorage.removeItem('passwordReset');
    }

    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const resetInfoRaw = sessionStorage.getItem('passwordReset');
    if (!resetInfoRaw) {
      setError(t('resetPasswordPage.otpExpired'));
      return;
    }
    const resetInfo = JSON.parse(resetInfoRaw);

    if (new Date().getTime() > resetInfo.expiry) {
        setError(t('resetPasswordPage.otpExpired'));
        sessionStorage.removeItem('passwordReset');
        return;
    }
    if (otp !== resetInfo.otp) {
        setError(t('resetPasswordPage.invalidOtp'));
        return;
    }
    if (newPassword.length < 8) {
        setError(t('resetPasswordPage.validation.passwordLength'));
        return;
    }
    if (newPassword !== confirmPassword) {
        setError(t('resetPasswordPage.validation.passwordMismatch'));
        return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const success = updateUserPassword(resetInfo.email, newPassword);
      if (success) {
        setIsSuccess(true);
        sessionStorage.removeItem('passwordReset');
      } else {
        // This case is unlikely if email was validated on the previous page, but good to have
        setError("An unexpected error occurred.");
      }
      setIsSubmitting(false);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isSuccess) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 py-12 px-4">
            <Card className="p-10 max-w-md w-full text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-smart-green rounded-full h-16 w-16 flex items-center justify-center">
                        <CheckIcon className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">{t('resetPasswordPage.successTitle')}</h1>
                <p className="mt-2 text-gray-600">{t('resetPasswordPage.successMessage')}</p>
                <div className="mt-6">
                    <Button to="/login">{t('resetPasswordPage.backToLogin')}</Button>
                </div>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-10 animate-on-scroll is-visible">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-smart-blue">{t('resetPasswordPage.title')}</h1>
            <p className="mt-2 text-sm text-gray-600">{t('resetPasswordPage.otpSubtitle')}</p>
            <p className="font-mono text-lg font-bold text-red-500 mt-2">{formatTime(timer)}</p>
          </div>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">{t('resetPasswordPage.otpLabel')}</label>
              <input id="otp" name="otp" type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-smart-blue focus:border-smart-blue sm:text-sm" placeholder={t('resetPasswordPage.otpPlaceholder')} />
            </div>
            <div>
              <label htmlFor="newPassword"  className="block text-sm font-medium text-gray-700">{t('resetPasswordPage.newPasswordLabel')}</label>
              <input id="newPassword" name="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-smart-blue focus:border-smart-blue sm:text-sm" />
            </div>
            <div>
              <label htmlFor="confirmPassword"  className="block text-sm font-medium text-gray-700">{t('resetPasswordPage.confirmPasswordLabel')}</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-smart-blue focus:border-smart-blue sm:text-sm" />
            </div>
            
            {error && <p className="text-sm text-red-600 text-center" role="alert">{error}</p>}

            <div className="pt-2">
              <Button type="submit" className="w-full flex justify-center" disabled={isSubmitting || timer === 0}>
                {isSubmitting ? <LoadingSpinner className="h-5 w-5 text-white" /> : (isSubmitting ? t('resetPasswordPage.resetting') : t('resetPasswordPage.resetButton'))}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;