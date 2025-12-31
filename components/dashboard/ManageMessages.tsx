import React, { useEffect, useMemo, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { LoadingSpinner, MailIcon } from '../ui/Icons';
import { useTranslation } from '../../hooks/useTranslation';
import { ContactMessage } from '../../types';
import { listContactMessages, replyContactMessage, updateContactMessageStatus } from '../../lib/apiClient';

const statusOptions: Array<{ value: ContactMessage['status'] | 'all'; labelKey: string }> = [
  { value: 'all', labelKey: 'dashboard.messages.filter.all' },
  { value: 'new', labelKey: 'dashboard.messages.filter.new' },
  { value: 'read', labelKey: 'dashboard.messages.filter.read' },
  { value: 'archived', labelKey: 'dashboard.messages.filter.archived' },
];

const ManageMessages: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessage['status']>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const selectedMessage = useMemo(
    () => messages.find(m => m.id === selectedId) || null,
    [messages, selectedId]
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listContactMessages(statusFilter === 'all' ? undefined : statusFilter);
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data ?? [];
      setMessages(data);
      if (!selectedId && data.length) {
        setSelectedId(data[0].id);
      }
    } catch (e: any) {
      setError(e?.message || t('dashboard.messages.errors.load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSelect = async (id: number, currentStatus: ContactMessage['status']) => {
    setSelectedId(id);
    if (currentStatus === 'new') {
      setUpdatingStatus(true);
      try {
        await updateContactMessageStatus(id, 'read');
        setMessages(prev => prev.map(m => (m.id === id ? { ...m, status: 'read' } : m)));
      } catch (e) {
        // best-effort; no surface error to keep UI simple
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setReplying(true);
    setError(null);
    try {
      const res = await replyContactMessage(selectedMessage.id, replyText.trim());
      setMessages(prev => prev.map(m => (m.id === selectedMessage.id ? { ...m, ...res } : m)));
      setReplyText('');
    } catch (e: any) {
      setError(e?.message || t('dashboard.messages.errors.reply'));
    } finally {
      setReplying(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedMessage) return;
    setUpdatingStatus(true);
    try {
      await updateContactMessageStatus(selectedMessage.id, selectedMessage.status === 'archived' ? 'read' : 'archived');
      setMessages(prev => prev.map(m => (m.id === selectedMessage.id ? { ...m, status: m.status === 'archived' ? 'read' : 'archived' } : m)));
    } catch (e: any) {
      setError(e?.message || t('dashboard.messages.errors.status'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <MailIcon className="text-smart-blue" />
            {t('dashboard.messages.title')}
          </h2>
          <select
            className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><LoadingSpinner className="h-6 w-6" /></div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : (
          <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.messages.empty')}</p>
            )}
            {messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg.id, msg.status)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selectedId === msg.id ? 'border-smart-blue bg-blue-50 dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{msg.name}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    msg.status === 'new' ? 'bg-green-100 text-green-700' : msg.status === 'archived' ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {t(`dashboard.messages.status.${msg.status}`)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{msg.email}</div>
                {msg.subject && <div className="text-xs text-gray-600 dark:text-gray-300 truncate">{msg.subject}</div>}
                <div className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleString()}</div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="lg:col-span-2 p-6">
        {!selectedMessage ? (
          <p className="text-gray-500 dark:text-gray-300">{t('dashboard.messages.noSelection')}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedMessage.subject || t('dashboard.messages.noSubject')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.messages.from')}: {selectedMessage.name} ({selectedMessage.email})</p>
                <p className="text-xs text-gray-400">{new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              <Button onClick={handleArchive} variant="secondary" disabled={updatingStatus}>
                {updatingStatus ? t('dashboard.messages.updating') : selectedMessage.status === 'archived' ? t('dashboard.messages.unarchive') : t('dashboard.messages.archive')}
              </Button>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-100">{selectedMessage.message}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('dashboard.messages.replyLabel')}</label>
              {selectedMessage.reply_message && (
                <div className="text-xs text-gray-500 dark:text-gray-300">
                  {t('dashboard.messages.lastReply')} {selectedMessage.replied_at ? new Date(selectedMessage.replied_at).toLocaleString() : ''}
                </div>
              )}
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={4}
                className="w-full border rounded-lg p-3 bg-white dark:bg-gray-800 dark:border-gray-700"
                placeholder={t('dashboard.messages.replyPlaceholder')}
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleReply} disabled={replying || !replyText.trim()} className="flex items-center gap-2">
                  {replying && <LoadingSpinner className="h-4 w-4" />}
                  {t('dashboard.messages.sendReply')}
                </Button>
                {selectedMessage.reply_message && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.messages.alreadyReplied')}</span>
                )}
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManageMessages;
