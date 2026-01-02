import React, { useState, useMemo, useContext, useRef, useEffect } from 'react';
import RichTextEditor from '../ui/RichTextEditor';
import { DataContext } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useAutoTranslation } from '../../hooks/useAutoTranslation';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Post } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import MediaPicker from '../ui/MediaPicker';
import { LoadingSpinner, LanguageIcon, MiniSpinner } from '../ui/Icons';

type TabType = 'list' | 'add';
type TranslatableField = 'title' | 'excerpt' | 'content';

const ManagePosts: React.FC = () => {
  const { posts, deletePost, updatePost, addPost } = useContext(DataContext);
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const { translate } = useAutoTranslation();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  // List state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  // Form state
  const initialFormState = {
    title: { ar: '', en: '' },
    excerpt: { ar: '', en: '' },
    content: { ar: '', en: '' },
    imageUrl: '',
    status: 'draft' as 'draft' | 'published',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isTranslating, setIsTranslating] = useState<Record<TranslatableField, boolean>>({
    title: false,
    excerpt: false,
    content: false,
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Check auto-translate setting from localStorage
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(() => {
    return localStorage.getItem('autoTranslateEnabled') !== 'false';
  });

  const debounceTimeoutRef = useRef<number | null>(null);
  const activeFieldRef = useRef<string | null>(null);

  // Reset form when switching to add tab or when editing a different post
  useEffect(() => {
    if (activeTab === 'add') {
      if (postToEdit) {
        setFormData({
          title: postToEdit.title,
          excerpt: postToEdit.excerpt,
          content: postToEdit.content,
          imageUrl: postToEdit.imageUrl,
          status: postToEdit.status,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [activeTab, postToEdit]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const filteredPosts = useMemo(() => {
    let displayPosts = posts;
    if (user && user.role === 'employee') {
      displayPosts = posts.filter(post => post.author === user.email);
    }

    return displayPosts
      .filter(post => {
        const title = language === 'ar' ? post.title.ar : post.title.en;
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .filter(post => {
        if (statusFilter === 'all') return true;
        return post.status === statusFilter;
      });
  }, [posts, searchQuery, statusFilter, language, user]);

  const handleEdit = (post: Post) => {
    setPostToEdit(post);
    setActiveTab('add');
  };

  const handleAddNew = () => {
    setPostToEdit(null);
    setActiveTab('add');
  };

  const handleDelete = (post: Post) => {
    setPostToDelete(post);
  };

  const confirmDelete = async () => {
    if (postToDelete) {
      await deletePost(postToDelete.id);
      setPostToDelete(null);
    }
  };

  const toggleStatus = async (post: Post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await updatePost({ ...post, status: newStatus });
  };

  // Form handlers
  const validate = () => {
    const newErrors: any = { title: {}, excerpt: {}, content: {} };
    let isValid = true;
    if (!formData.title.en.trim()) { newErrors.title.en = t('contact.validation.fieldRequired'); isValid = false; }
    if (!formData.title.ar.trim()) { newErrors.title.ar = t('contact.validation.fieldRequired'); isValid = false; }
    if (!formData.excerpt.en.trim()) { newErrors.excerpt.en = t('contact.validation.fieldRequired'); isValid = false; }
    if (!formData.excerpt.ar.trim()) { newErrors.excerpt.ar = t('contact.validation.fieldRequired'); isValid = false; }
    if (!formData.content.en.trim()) { newErrors.content.en = t('contact.validation.fieldRequired'); isValid = false; }
    if (!formData.content.ar.trim()) { newErrors.content.ar = t('contact.validation.fieldRequired'); isValid = false; }
    if (!formData.imageUrl.trim()) { newErrors.imageUrl = t('contact.validation.fieldRequired'); isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    activeFieldRef.current = name;

    if (name.includes('.')) {
      const [field, lang] = name.split('.') as [TranslatableField, 'ar' | 'en'];
      setFormData(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Only auto-translate if enabled
    if (!autoTranslateEnabled) {
      return;
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
      const translationContext = `a blog post ${baseField}`;
      const translatedValue = await translate(value, translationContext);

      if (translatedValue && activeFieldRef.current === name) {
        setFormData(prev => {
          const sourceValueWhenStarted = value;
          const currentSourceValue = prev[baseField][sourceLang];
          if (currentSourceValue === sourceValueWhenStarted) {
            return { ...prev, [baseField]: { ...prev[baseField], [targetLang]: translatedValue } };
          }
          return prev;
        });
      }
      setIsTranslating(prev => ({ ...prev, [baseField]: false }));
    }, 800);
  };

  const handleQuillChange = (field: TranslatableField, lang: 'ar' | 'en', value: string) => {
    const name = `${field}.${lang}`;
    activeFieldRef.current = name;

    setFormData(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));

    if (!autoTranslateEnabled) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!value.trim() || value === '<p><br></p>') {
      setIsTranslating(prev => ({ ...prev, [field]: false }));
      return;
    }

    setIsTranslating(prev => ({ ...prev, [field]: true }));

    debounceTimeoutRef.current = window.setTimeout(async () => {
      if (activeFieldRef.current !== name) {
        setIsTranslating(prev => ({ ...prev, [field]: false }));
        return;
      }

      const targetLang = lang === 'ar' ? 'en' : 'ar';
      // Use specialized prompt for HTML content
      const translationContext = `a blog post ${field} in HTML format. Keep the HTML tags (like <p>, <strong>, <ul>, etc.) exactly as they are and only translate the text content inside them.`;
      const translatedValue = await translate(value, translationContext);

      if (translatedValue && activeFieldRef.current === name) {
        setFormData(prev => {
          if (prev[field][lang] === value) {
            return { ...prev, [field]: { ...prev[field], [targetLang]: translatedValue } };
          }
          return prev;
        });
      }
      setIsTranslating(prev => ({ ...prev, [field]: false }));
    }, 1000); // Slightly longer debounce for HTML
  };

  // Manual translate function for when auto-translate is disabled
  const handleManualTranslate = async (field: TranslatableField) => {
    // Determine which language has content and translate to the other
    const enValue = formData[field].en.trim();
    const arValue = formData[field].ar.trim();

    if (!enValue && !arValue) return;

    setIsTranslating(prev => ({ ...prev, [field]: true }));

    try {
      const translationContext = `a blog post ${field}`;

      if (enValue && !arValue) {
        // Translate English to Arabic
        const translatedValue = await translate(enValue, translationContext);
        if (translatedValue) {
          setFormData(prev => ({ ...prev, [field]: { ...prev[field], ar: translatedValue } }));
        }
      } else if (arValue && !enValue) {
        // Translate Arabic to English
        const translatedValue = await translate(arValue, translationContext);
        if (translatedValue) {
          setFormData(prev => ({ ...prev, [field]: { ...prev[field], en: translatedValue } }));
        }
      } else if (enValue) {
        // Both have content, translate from English to Arabic
        const translatedValue = await translate(enValue, translationContext);
        if (translatedValue) {
          setFormData(prev => ({ ...prev, [field]: { ...prev[field], ar: translatedValue } }));
        }
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user) return;

    const submitData = { ...formData, status: asDraft ? 'draft' as const : formData.status };

    setIsSubmitting(true);
    try {
      if (postToEdit) {
        await updatePost({ ...postToEdit, ...submitData });
      } else {
        await addPost(submitData, user.email);
      }
      // Reset and go back to list
      setFormData(initialFormState);
      setPostToEdit(null);
      setActiveTab('list');
    } catch (err) {
      console.error('Failed to save post', err);
      alert('Could not save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setPostToEdit(null);
    setActiveTab('list');
  };

  const getInputClasses = (error?: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none transition duration-150 ease-in-out bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${error
      ? 'border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-smart-blue'
    }`;

  const renderTranslatableField = (field: TranslatableField, label: string, type: 'input' | 'textarea' = 'input') => {
    const InputComponent = type === 'input' ? 'input' : 'textarea';
    const rows = type === 'textarea' ? (field === 'excerpt' ? 3 : 6) : undefined;
    const hasContent = formData[field].en.trim() || formData[field].ar.trim();
    const isRichText = field === 'content';

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {isTranslating[field] && <MiniSpinner className="inline-block ml-2 h-4 w-4 text-smart-blue" />}
          </label>
          {/* Manual translate button - shown when auto-translate is disabled */}
          {!autoTranslateEnabled && hasContent && (
            <button
              type="button"
              onClick={() => handleManualTranslate(field)}
              disabled={isTranslating[field]}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-smart-blue hover:text-smart-blue-dark bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
            >
              <LanguageIcon className="h-3 w-3" />
              {isTranslating[field] ? 'Translating...' : 'Translate'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">English</span>
              <LanguageIcon className="h-3 w-3 text-gray-400" />
            </div>
            {isRichText ? (
              <RichTextEditor
                value={formData[field].en}
                onChange={(val) => handleQuillChange(field, 'en', val)}
                placeholder={`Enter ${field} in English...`}
                dir="ltr"
              />
            ) : (
              <InputComponent
                name={`${field}.en`}
                value={formData[field].en}
                onChange={handleInputChange}
                rows={rows}
                className={getInputClasses(errors[field]?.en)}
                placeholder={`Enter ${field} in English...`}
              />
            )}
            {errors[field]?.en && <p className="text-red-600 text-xs mt-1">{errors[field].en}</p>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">العربية</span>
              <LanguageIcon className="h-3 w-3 text-gray-400" />
            </div>
            {isRichText ? (
              <RichTextEditor
                value={formData[field].ar}
                onChange={(val) => handleQuillChange(field, 'ar', val)}
                placeholder={`أدخل ${(field as string) === 'title' ? 'العنوان' : (field as string) === 'excerpt' ? 'المقتطف' : 'المحتوى'} بالعربية...`}
                dir="rtl"
              />
            ) : (
              <InputComponent
                name={`${field}.ar`}
                value={formData[field].ar}
                onChange={handleInputChange}
                dir="rtl"
                rows={rows}
                className={getInputClasses(errors[field]?.ar)}
                placeholder={`أدخل ${(field as string) === 'title' ? 'العنوان' : (field as string) === 'excerpt' ? 'المقتطف' : 'المحتوى'} بالعربية...`}
              />
            )}
            {errors[field]?.ar && <p className="text-red-600 text-xs mt-1">{errors[field].ar}</p>}
          </div>
        </div>
      </div>
    );
  };

  // Render Posts List Tab
  const renderListTab = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('dashboard.posts.title')}</h2>
        <Button onClick={handleAddNew}>{t('dashboard.posts.addPost')}</Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder={t('dashboard.posts.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="all">{t('dashboard.posts.all')}</option>
          <option value="published">{t('dashboard.posts.published')}</option>
          <option value="draft">{t('dashboard.posts.draft')}</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dashboard.posts.table.title')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dashboard.posts.table.author')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dashboard.posts.table.status')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dashboard.posts.table.date')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dashboard.posts.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPosts.length > 0 ? filteredPosts.map((post) => (
              <tr key={post.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-black/10">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{t(post.title)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{post.author}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge color={post.status === 'published' ? 'green' : 'gray'}>
                    {t(`dashboard.posts.${post.status}` as any)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{post.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 rtl:space-x-reverse">
                  <button onClick={() => toggleStatus(post)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" title={t('dashboard.posts.toggleStatus')}>
                    {post.status === 'published' ? t('dashboard.posts.unpublish') : t('dashboard.posts.publish')}
                  </button>
                  <button onClick={() => handleEdit(post)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">{t('dashboard.posts.edit')}</button>
                  <button onClick={() => handleDelete(post)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">{t('dashboard.posts.delete')}</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">{t('dashboard.posts.noPosts')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  // Render Add/Edit Post Form Tab
  const renderFormTab = () => (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {postToEdit ? t('dashboard.postForm.editTitle') : t('dashboard.postForm.addTitle')}
        </h2>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {t('dashboard.postsTabs.backToPosts')}
        </button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {renderTranslatableField('title', t('dashboard.postForm.titleEn')?.replace(' (English)', '') || 'Title', 'input')}
        {renderTranslatableField('excerpt', t('dashboard.postForm.excerptEn')?.replace(' (English)', '') || 'Excerpt', 'textarea')}
        {renderTranslatableField('content', t('dashboard.postForm.contentEn')?.replace(' (English)', '') || 'Content', 'textarea')}

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('dashboard.postForm.headerImage')}
          </label>
          <div className="flex gap-4 items-start">
            <div className="w-32 h-20 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">No Image</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className={getInputClasses(errors.imageUrl) + ' flex-1'}
                />
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Browse
                </button>
              </div>
              {errors.imageUrl && <p className="text-red-600 text-xs">{errors.imageUrl}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400">Enter URL or browse media library</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('dashboard.postForm.status')}
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={getInputClasses() + ' max-w-xs'}
          >
            <option value="draft">{t('dashboard.posts.draft')}</option>
            <option value="published">{t('dashboard.posts.published')}</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleCancel} type="button">
            {t('dashboard.postForm.cancel')}
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, true)}
          >
            Save as Draft
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? <LoadingSpinner className="h-5 w-5 text-white" /> : (postToEdit ? t('dashboard.postForm.save') : 'Publish')}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <Card>
      {/* Internal Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8 rtl:space-x-reverse" aria-label="Tabs">
          <button
            onClick={() => { setActiveTab('list'); setPostToEdit(null); }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'list'
              ? 'border-smart-blue text-smart-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
          >
            📋 {t('dashboard.postsTabs.allPosts')}
          </button>
          <button
            onClick={() => { setActiveTab('add'); setPostToEdit(null); }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'add' && !postToEdit
              ? 'border-smart-blue text-smart-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
              }`}
          >
            ➕ {t('dashboard.postsTabs.addNew')}
          </button>
          {postToEdit && (
            <span className="py-3 px-1 border-b-2 border-smart-blue text-smart-blue font-medium text-sm">
              ✏️ {t('dashboard.postsTabs.editing')} {language === 'ar' ? postToEdit.title.ar.substring(0, 20) : postToEdit.title.en.substring(0, 20)}...
            </span>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && renderListTab()}
      {activeTab === 'add' && renderFormTab()}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <ConfirmationModal
          isOpen={!!postToDelete}
          onClose={() => setPostToDelete(null)}
          onConfirm={confirmDelete}
          title={t('dashboard.confirmDelete.title')}
          message={t('dashboard.confirmDelete.messagePost')}
        />
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker
          value={formData.imageUrl}
          onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </Card>
  );
};

export default ManagePosts;