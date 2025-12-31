
import React, { useState, useContext, useEffect, useRef } from 'react';
import { DataContext } from '../../contexts/DataContext';
import { apiRequest } from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useAutoTranslation } from '../../hooks/useAutoTranslation';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { LoadingSpinner, CheckIcon, MiniSpinner, LanguageIcon } from '../ui/Icons';
import { SiteInfo } from '../../types';
import LogoCropperModal from './LogoCropperModal';

const SiteSettings: React.FC = () => {
  const { siteInfo, updateSiteInfo } = useContext(DataContext);
  const { user } = useAuth();
  const { t } = useTranslation();
  const { translate } = useAutoTranslation();

  const [formData, setFormData] = useState<SiteInfo>(siteInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [cropperState, setCropperState] = useState({ isOpen: false, imageSrc: '' });

  // Translation settings
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(() => {
    return localStorage.getItem('autoTranslateEnabled') !== 'false';
  });
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const activeFieldRef = useRef<string | null>(null);

  // Check if user is Super admin
  const isSuperAdmin = user?.role === 'Super admin';

  useEffect(() => {
    setFormData(siteInfo);
  }, [siteInfo]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleAutoTranslateToggle = () => {
    const newValue = !autoTranslateEnabled;
    setAutoTranslateEnabled(newValue);
    localStorage.setItem('autoTranslateEnabled', String(newValue));
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    setApiKeyStatus('saving');

    try {
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: [
            { key: 'gemini_api_key', value: apiKey, group: 'translation' }
          ]
        })
      });
      setApiKeyStatus('saved');
      setTimeout(() => setApiKeyStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save API key:', error);
      setApiKeyStatus('error');
    }
  };

  const handleDeleteApiKey = async () => {
    setApiKeyStatus('saving');
    try {
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: [
            { key: 'gemini_api_key', value: '', group: 'translation' }
          ]
        })
      });
      setApiKey('');
      setApiKeyStatus('idle');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      setApiKeyStatus('error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    activeFieldRef.current = name;

    if (name.includes('.')) {
      const [field, lang] = name.split('.') as ['address', 'ar' | 'en'];
      setFormData(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value as string }));
    }

    // Only auto-translate if enabled
    if (!autoTranslateEnabled) {
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!name.includes('.')) return;
    if (!value.trim()) {
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);

    debounceTimeoutRef.current = window.setTimeout(async () => {
      if (activeFieldRef.current !== name) {
        setIsTranslating(false);
        return;
      }

      const [_baseField, sourceLang] = name.split('.') as ['address', 'ar' | 'en'];
      const targetLang = sourceLang === 'ar' ? 'en' : 'ar';
      const translatedValue = await translate(value, "a business address");

      if (translatedValue && activeFieldRef.current === name) {
        setFormData(prev => ({ ...prev, address: { ...prev.address, [targetLang]: translatedValue } }));
      }
      setIsTranslating(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      updateSiteInfo(formData);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setCropperState({ isOpen: true, imageSrc: event.target?.result as string });
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset file input
    }
  };

  const handleSaveCrop = (base64Image: string) => {
    setFormData(prev => ({ ...prev, logoUrl: base64Image }));
    setCropperState({ isOpen: false, imageSrc: '' });
  };

  const getInputClasses = () =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none transition duration-150 ease-in-out bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-smart-blue`;

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('dashboard.settings.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.settings.subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website Logo</label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-md flex items-center justify-center overflow-hidden">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400 p-2 text-center">No Logo</span>
                )}
              </div>
              <input type="file" accept="image/png, image/jpeg, image/svg+xml" ref={fileInputRef} onChange={handleFileChange} hidden />
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Upload Logo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center justify-center h-5 w-5 bg-gray-100 dark:bg-gray-600 rounded-full border dark:border-gray-500 z-10">
              {isTranslating ? <MiniSpinner className="h-4 w-4 text-smart-blue" /> : <LanguageIcon className="h-4 w-4 text-gray-400" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dashboard.settings.addressEn')}
              </label>
              <input type="text" name="address.en" value={formData.address.en} onChange={handleInputChange} className={getInputClasses()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dashboard.settings.addressAr')}
              </label>
              <input type="text" name="address.ar" value={formData.address.ar} onChange={handleInputChange} dir="rtl" className={getInputClasses()} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dashboard.settings.phone')}</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className={getInputClasses()} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dashboard.settings.email')}</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={getInputClasses()} />
          </div>
          <div className="pt-4 flex items-center gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex items-center justify-center min-w-[150px]">
              {isSubmitting ? <LoadingSpinner className="h-5 w-5 text-white" /> : t('dashboard.settings.save')}
            </Button>
            {showSuccess && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 transition-opacity duration-300">
                <CheckIcon className="h-5 w-5" />
                <span>{t('dashboard.settings.success')}</span>
              </div>
            )}
          </div>
        </form>
      </Card>

      {/* Translation Settings */}
      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Translation Settings</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure automatic translation behavior</p>
        </div>

        <div className="space-y-4 max-w-lg">
          {/* Auto-translate toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-Translate Content
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Automatically translate content as you type
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoTranslateToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-smart-blue focus:ring-offset-2 ${autoTranslateEnabled ? 'bg-smart-blue' : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoTranslateEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          {/* API Key Management - Super admin only */}
          {isSuperAdmin && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gemini API Key (Super Admin Only)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className={getInputClasses()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showApiKey ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim() || apiKeyStatus === 'saving'}
                  className="text-sm"
                >
                  {apiKeyStatus === 'saving' ? 'Saving...' : apiKeyStatus === 'saved' ? '✓ Saved' : 'Save Key'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDeleteApiKey}
                  className="text-sm"
                >
                  Delete Key
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-smart-blue hover:underline">Google AI Studio</a>
              </p>
            </div>
          )}
        </div>
      </Card>

      {cropperState.isOpen && (
        <LogoCropperModal
          isOpen={cropperState.isOpen}
          onClose={() => setCropperState({ isOpen: false, imageSrc: '' })}
          imageSrc={cropperState.imageSrc}
          onSave={handleSaveCrop}
        />
      )}
    </div>
  );
};

export default SiteSettings;