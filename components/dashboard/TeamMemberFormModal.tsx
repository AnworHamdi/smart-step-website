
import React, { useState, useContext, useEffect, useRef } from 'react';
import { DataContext } from '../../contexts/DataContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useAutoTranslation } from '../../hooks/useAutoTranslation';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { TeamMember } from '../../types';
import { LoadingSpinner, LanguageIcon, MiniSpinner } from '../ui/Icons';

interface TeamMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
}

type TranslatableField = 'name' | 'role';

const TeamMemberFormModal: React.FC<TeamMemberFormModalProps> = ({ isOpen, onClose, member }) => {
  const { addTeamMember, updateTeamMember } = useContext(DataContext);
  const { t } = useTranslation();
  const { translate } = useAutoTranslation();

  const initialFormState = {
    name: { ar: '', en: '' },
    role: { ar: '', en: '' },
    imageUrl: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isTranslating, setIsTranslating] = useState<Record<TranslatableField, boolean>>({
    name: false,
    role: false,
  });

  const debounceTimeoutRef = useRef<number | null>(null);
  const activeFieldRef = useRef<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        role: member.role,
        imageUrl: member.imageUrl,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
    setIsTranslating({ name: false, role: false });
  }, [member, isOpen]);
  
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const validate = () => {
    const newErrors: any = { name: {}, role: {} };
    let isValid = true;
    if (!formData.name.en.trim()) { newErrors.name.en = t('contact.validation.fieldRequired'); isValid = false; }
    if (!formData.name.ar.trim()) { newErrors.name.ar = t('contact.validation.fieldRequired'); isValid = false; }
    if (!formData.role.en.trim()) { newErrors.role.en = t('contact.validation.fieldRequired'); isValid = false; }
    if (!formData.role.ar.trim()) { newErrors.role.ar = t('contact.validation.fieldRequired'); isValid = false; }
    if (!formData.imageUrl.trim()) { newErrors.imageUrl = t('contact.validation.fieldRequired'); isValid = false; }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    activeFieldRef.current = name;

    if (name.includes('.')) {
      const [field, lang] = name.split('.') as [TranslatableField, 'ar' | 'en'];
      setFormData(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (!name.includes('.')) return;

    const [baseField, sourceLang] = name.split('.') as [TranslatableField, 'ar' | 'en'];
    
    if (!value.trim()) {
        setIsTranslating(prev => ({ ...prev, [baseField]: false }));
        return;
    }
    
    setIsTranslating(prev => ({ ...prev, [baseField]: true }));

    debounceTimeoutRef.current = window.setTimeout(async () => {
      if (activeFieldRef.current !== name) {
        setIsTranslating(prev => ({ ...prev, [baseField]: false }));
        return;
      }
      
      const targetLang = sourceLang === 'ar' ? 'en' : 'ar';
      const translationContext = `a team member's ${baseField}`;
      const translatedValue = await translate(value, translationContext);

      if (translatedValue && activeFieldRef.current === name) {
        setFormData(prev => ({ ...prev, [baseField]: { ...prev[baseField], [targetLang]: translatedValue }}));
      }
      setIsTranslating(prev => ({ ...prev, [baseField]: false }));
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      if (member) {
        updateTeamMember({ ...member, ...formData });
      } else {
        addTeamMember(formData);
      }
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };
  
  const getInputClasses = (error?: string) => 
    `w-full px-3 py-2 border rounded-lg focus:outline-none transition duration-150 ease-in-out bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
      error
        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-smart-blue'
    }`;

  const renderTranslatableField = (field: TranslatableField) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center justify-center h-5 w-5 bg-gray-100 dark:bg-gray-600 rounded-full border dark:border-gray-500 z-10">
                {isTranslating[field] ? <MiniSpinner /> : <LanguageIcon />}
            </div>
            <div>
                <label htmlFor={`${field}-en`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t(`dashboard.teamForm.${field}En`)}
                </label>
                <input 
                    type="text"
                    id={`${field}-en`}
                    name={`${field}.en`} 
                    value={formData[field].en} 
                    onChange={handleInputChange} 
                    className={getInputClasses(errors[field]?.en)} 
                    aria-describedby={errors[field]?.en ? `${field}-en-error` : undefined}
                />
                {errors[field]?.en && <p id={`${field}-en-error`} className="text-red-600 text-xs mt-1" role="alert">{errors[field].en}</p>}
            </div>
            <div>
                <label htmlFor={`${field}-ar`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t(`dashboard.teamForm.${field}Ar`)}
                </label>
                <input
                    type="text"
                    id={`${field}-ar`}
                    name={`${field}.ar`} 
                    value={formData[field].ar} 
                    onChange={handleInputChange} 
                    dir="rtl" 
                    className={getInputClasses(errors[field]?.ar)}
                    aria-describedby={errors[field]?.ar ? `${field}-ar-error` : undefined}
                />
                {errors[field]?.ar && <p id={`${field}-ar-error`} className="text-red-600 text-xs mt-1" role="alert">{errors[field].ar}</p>}
            </div>
        </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={member ? t('dashboard.teamForm.editTitle') : t('dashboard.teamForm.addTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderTranslatableField('name')}
        {renderTranslatableField('role')}

        <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dashboard.teamForm.imageUrl')}</label>
            <input id="imageUrl" type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className={getInputClasses(errors.imageUrl)} aria-describedby={errors.imageUrl ? 'imageUrl-error' : undefined} />
            {errors.imageUrl && <p id="imageUrl-error" className="text-red-600 text-xs mt-1" role="alert">{errors.imageUrl}</p>}
        </div>
        
        <div className="pt-4 flex justify-end gap-4">
            <Button variant="secondary" onClick={onClose} type="button">
                {t('dashboard.teamForm.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex items-center justify-center min-w-[120px]">
                {isSubmitting ? <LoadingSpinner/> : (member ? t('dashboard.teamForm.save') : t('dashboard.teamForm.addTitle'))}
            </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamMemberFormModal;