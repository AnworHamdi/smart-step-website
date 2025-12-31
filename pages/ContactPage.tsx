
import React, { useState, useContext } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CheckIcon,
  LoadingSpinner,
} from '../components/ui/Icons';
import { DataContext } from '../contexts/DataContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useSeo } from '../hooks/useSeo';
import Skeleton from '../components/ui/Skeleton';
import { sendContact } from '../lib/apiClient';


type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const { siteInfo, loading } = useContext(DataContext);
  useSeo(t('contact.title'), t('contact.subtitle'));
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mainContentRef = useScrollAnimation<HTMLDivElement>();

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = t('contact.validation.required');
    if (!formData.email.trim()) {
      newErrors.email = t('contact.validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.validation.invalidEmail');
    }
    if (!formData.subject.trim()) newErrors.subject = t('contact.validation.required');
    if (!formData.message.trim()) {
      newErrors.message = t('contact.validation.required');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('contact.validation.minLength');
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await sendContact(formData);
        setIsSubmitted(true);
      } catch (err) {
        console.error('Failed to send contact', err);
        setSubmitError(t('contact.errorMessage'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleResetForm = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setIsSubmitted(false);
    setSubmitError(null);
  };
  
  const getInputClasses = (field: keyof FormData) => 
    `w-full px-4 py-3 border rounded-lg focus:outline-none transition duration-150 ease-in-out bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
      errors[field]
        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-smart-blue'
    }`;


  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 animate-on-scroll is-visible">
          <h1 className="text-4xl md:text-5xl font-bold text-smart-blue">{t('contact.title')}</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </div>
        
        <div ref={mainContentRef} className="grid lg:grid-cols-5 gap-10 animate-on-scroll">
          <div className="lg:col-span-3">
            <Card className="p-8">
              {isSubmitted ? (
                <div className="text-center py-10 flex flex-col items-center">
                  <div className="bg-smart-green rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <CheckIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('contact.successTitle')}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{t('contact.successMessage')}</p>
                  <Button onClick={handleResetForm} variant="secondary">
                    {t('contact.sendAnother')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {submitError && (
                    <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                      {submitError}
                    </div>
                  )}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.name')}</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={getInputClasses('name')} aria-describedby={errors.name ? 'name-error' : undefined} />
                    {errors.name && <p id="name-error" className="text-red-600 text-xs mt-1" aria-live="polite">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.email')}</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={getInputClasses('email')} aria-describedby={errors.email ? 'email-error' : undefined} />
                    {errors.email && <p id="email-error" className="text-red-600 text-xs mt-1" aria-live="polite">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.subject')}</label>
                    <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className={getInputClasses('subject')} aria-describedby={errors.subject ? 'subject-error' : undefined} />
                    {errors.subject && <p id="subject-error" className="text-red-600 text-xs mt-1" aria-live="polite">{errors.subject}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.message')}</label>
                    <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required className={getInputClasses('message')} aria-describedby={errors.message ? 'message-error' : undefined}></textarea>
                    {errors.message && <p id="message-error" className="text-red-600 text-xs mt-1" aria-live="polite">{errors.message}</p>}
                  </div>
                  <div>
                    <Button type="submit" className="w-full justify-center flex items-center" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner className="h-5 w-5 -ml-1 ltr:mr-3 rtl:ml-3" />
                          <span>{t('contact.submitting')}</span>
                        </>
                      ) : (
                        t('contact.send')
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="p-8 h-full">
              {loading ? (
                 <>
                    <Skeleton className="h-8 w-1/2 mb-6" />
                    <div className="space-y-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-4 rtl:space-x-reverse">
                          <Skeleton className="w-6 h-6 rounded-md flex-shrink-0 mt-1" />
                          <div className="w-full">
                            <Skeleton className="h-5 w-1/4 mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t('contact.infoTitle')}</h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0 text-smart-blue mt-1"><MapPinIcon /></div>
                      <div>
                        <h3 className="font-semibold dark:text-gray-200">{t('contact.address')}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{t(siteInfo.address)}</p>
                      </div>
                    </div>
                    {siteInfo.phone && (
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0 text-smart-blue mt-1"><PhoneIcon /></div>
                      <div>
                        <h3 className="font-semibold dark:text-gray-200">{t('contact.phoneLabel')}</h3>
                        <a href={`tel:${siteInfo.phone}`} className="text-gray-500 dark:text-gray-400 hover:text-smart-blue" dir="ltr">{siteInfo.phone}</a>
                      </div>
                    </div>
                    )}
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0 text-smart-blue mt-1"><MailIcon /></div>
                      <div>
                        <h3 className="font-semibold dark:text-gray-200">{t('contact.email')}</h3>
                        <a href={`mailto:${siteInfo.email}`} className="text-gray-500 dark:text-gray-400 hover:text-smart-blue">{siteInfo.email}</a>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
