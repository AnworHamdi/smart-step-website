
import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../contexts/DataContext';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { User } from '../../types';
import { LoadingSpinner } from '../ui/Icons';
import { useAuth } from '../../contexts/AuthContext';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const RESTRICTED_DOMAIN = 'smartstep.ly';

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, user }) => {
  const { addUser, updateUser, users } = useContext(DataContext);
  const { t, language } = useTranslation();
  const { generateAndShowEmail } = useAuth();

  const initialFormState = {
    email: '',
    password: '',
    role: 'employee' as User['role'],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});


  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [user, isOpen]);

  const validate = () => {
    const newErrors: any = {};
    let isValid = true;

    // Email Validation
    if (!formData.email.trim()) {
      newErrors.email = t('contact.validation.fieldRequired');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.validation.invalidEmail');
      isValid = false;
    } else if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== user?.id)) {
      newErrors.email = t('dashboard.userForm.emailExists');
      isValid = false;
    } else if (formData.email.endsWith(`@${RESTRICTED_DOMAIN}`)) {
      newErrors.email = t('dashboard.userForm.emailDomainRestricted');
      isValid = false;
    }

    // Password required only for new users
    if (!user && !formData.password) {
      newErrors.password = t('contact.validation.fieldRequired');
      isValid = false;
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = t('resetPasswordPage.validation.passwordLength');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const userData = {
      email: formData.email,
      role: formData.role,
      ...(formData.password && { password: formData.password }),
    };

    try {
      if (user) {
        await updateUser({
          ...user,
          ...userData,
          password: formData.password || user.password
        });
      } else {
        const verificationToken = await addUser(userData as Omit<User, 'id' | 'verified'>);
        if (verificationToken) {
          const verificationLink = `${window.location.origin}${window.location.pathname}#/verify-email/${verificationToken}`;
          await generateAndShowEmail('new-user', { verificationLink }, language);
        }
      }
      onClose();
    } catch (err) {
      console.error('Failed to save user', err);
      alert('Could not save user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClasses = (error?: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none transition duration-150 ease-in-out bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${error
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-smart-blue'
    }`;


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? t('dashboard.userForm.editTitle') : t('dashboard.userForm.addTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dashboard.userForm.email')}</label>
          <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className={getInputClasses(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
          {errors.email && <p id="email-error" className="text-red-600 text-xs mt-1" role="alert">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dashboard.userForm.password')}</label>
          <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} className={getInputClasses(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
          {errors.password && <p id="password-error" className="text-red-600 text-xs mt-1" role="alert">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dashboard.userForm.role')}</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} className={getInputClasses()}>
            <option value="employee">{t('dashboard.users.roleEmployee')}</option>
            <option value="admin">{t('dashboard.users.roleAdmin')}</option>
          </select>
        </div>
        <div className="pt-4 flex justify-end gap-4">
          <Button variant="secondary" onClick={onClose} type="button">
            {t('dashboard.userForm.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex items-center justify-center min-w-[120px]">
            {isSubmitting ? <LoadingSpinner className="h-5 w-5 text-white" /> : t('dashboard.userForm.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;