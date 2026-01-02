import React, { useEffect, useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { LoadingSpinner, MailIcon, TrashIcon } from '../ui/Icons';
import { useTranslation } from '../../hooks/useTranslation';
import { EmailSubscription } from '../../types';
import { listSubscriptions, updateSubscriptionStatus, deleteSubscription, broadcastAnnouncement } from '../../lib/apiClient';

const statusOptions: Array<{ value: EmailSubscription['status'] | 'all'; labelKey: string }> = [
    { value: 'all', labelKey: 'dashboard.subscriptions.filter.all' },
    { value: 'active', labelKey: 'dashboard.subscriptions.filter.active' },
    { value: 'unsubscribed', labelKey: 'dashboard.subscriptions.filter.unsubscribed' },
];

const ManageSubscriptions: React.FC = () => {
    const { t } = useTranslation();
    const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | EmailSubscription['status']>('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Broadcast modal state
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastContent, setBroadcastContent] = useState('');
    const [broadcastLoading, setBroadcastLoading] = useState(false);
    const [broadcastSuccess, setBroadcastSuccess] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listSubscriptions(statusFilter === 'all' ? undefined : statusFilter);
            const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data ?? [];
            setSubscriptions(data);
        } catch (e: any) {
            console.error('Failed to load subscriptions:', e);
            setError(e?.message || t('dashboard.subscriptions.errors.load'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const handleToggleStatus = async (sub: EmailSubscription) => {
        const newStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
        setActionLoading(sub.id);
        try {
            await updateSubscriptionStatus(sub.id, newStatus);
            setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: newStatus } : s));
        } catch (e: any) {
            setError(e?.message || t('dashboard.subscriptions.errors.update'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('dashboard.subscriptions.confirmDelete'))) return;
        setActionLoading(id);
        try {
            await deleteSubscription(id);
            setSubscriptions(prev => prev.filter(s => s.id !== id));
        } catch (e: any) {
            setError(e?.message || t('dashboard.subscriptions.errors.delete'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcastSubject.trim() || !broadcastContent.trim()) return;
        setBroadcastLoading(true);
        setError(null);
        try {
            await broadcastAnnouncement(broadcastSubject, broadcastContent);
            setBroadcastSuccess(true);
            setTimeout(() => {
                setShowBroadcastModal(false);
                setBroadcastSuccess(false);
                setBroadcastSubject('');
                setBroadcastContent('');
            }, 2000);
        } catch (e: any) {
            setError(e?.message || 'Failed to send broadcast');
        } finally {
            setBroadcastLoading(false);
        }
    };

    const activeSubscriberCount = subscriptions.filter(s => s.status === 'active').length;

    return (
        <>
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <MailIcon className="text-smart-blue" />
                        {t('dashboard.subscriptions.title') || 'Email Subscriptions'}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button onClick={() => setShowBroadcastModal(true)} disabled={activeSubscriberCount === 0}>
                            {t('dashboard.subscriptions.broadcast.button') || '📢 Send Broadcast'}
                        </Button>
                        <select
                            className="border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {t(opt.labelKey) || opt.value}
                                </option>
                            ))}
                        </select>
                        <Button onClick={load} variant="secondary" disabled={loading}>
                            {loading ? <LoadingSpinner className="h-4 w-4" /> : t('dashboard.refresh') || 'Refresh'}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner className="h-8 w-8" />
                    </div>
                ) : subscriptions.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        {t('dashboard.subscriptions.empty') || 'No subscriptions found'}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">
                                        {t('dashboard.subscriptions.email') || 'Email'}
                                    </th>
                                    <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">
                                        {t('dashboard.subscriptions.name') || 'Name'}
                                    </th>
                                    <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">
                                        {t('dashboard.subscriptions.status') || 'Status'}
                                    </th>
                                    <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">
                                        {t('dashboard.subscriptions.date') || 'Date'}
                                    </th>
                                    <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">
                                        {t('dashboard.subscriptions.actions') || 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map(sub => (
                                    <tr key={sub.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                                            {sub.email}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                            {sub.name || '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${sub.status === 'active'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                                }`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-sm">
                                            {new Date(sub.subscribed_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleToggleStatus(sub)}
                                                    disabled={actionLoading === sub.id}
                                                    className="text-xs py-1 px-2"
                                                >
                                                    {actionLoading === sub.id ? (
                                                        <LoadingSpinner className="h-3 w-3" />
                                                    ) : sub.status === 'active' ? (
                                                        t('dashboard.subscriptions.unsubscribe') || 'Unsubscribe'
                                                    ) : (
                                                        t('dashboard.subscriptions.resubscribe') || 'Resubscribe'
                                                    )}
                                                </Button>
                                                <button
                                                    onClick={() => handleDelete(sub.id)}
                                                    disabled={actionLoading === sub.id}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                                    title={t('dashboard.subscriptions.delete') || 'Delete'}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {t('dashboard.subscriptions.total') || 'Total'}: {subscriptions.length} {t('dashboard.subscriptions.subscribers') || 'subscribers'}
                    {activeSubscriberCount > 0 && ` (${activeSubscriberCount} active)`}
                </div>
            </Card>

            {/* Broadcast Modal */}
            {showBroadcastModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {t('dashboard.subscriptions.broadcast.title') || '📢 Send Broadcast'}
                            </h3>
                            <button
                                onClick={() => setShowBroadcastModal(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {t('dashboard.subscriptions.broadcast.description') ||
                                `This will send an email to all active subscribers.`} ({activeSubscriberCount} {t('dashboard.subscriptions.broadcast.activeCount') || 'active'})
                        </p>

                        {broadcastSuccess ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-4">✅</div>
                                <p className="text-green-600 dark:text-green-400 font-semibold">
                                    {t('dashboard.subscriptions.broadcast.success') || 'Broadcast sent successfully!'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('dashboard.subscriptions.broadcast.subject') || 'Subject'} *
                                    </label>
                                    <input
                                        type="text"
                                        value={broadcastSubject}
                                        onChange={e => setBroadcastSubject(e.target.value)}
                                        placeholder={t('dashboard.subscriptions.broadcast.subjectPlaceholder') || 'Newsletter subject...'}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-smart-blue focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('dashboard.subscriptions.broadcast.content') || 'Content'} *
                                    </label>
                                    <textarea
                                        value={broadcastContent}
                                        onChange={e => setBroadcastContent(e.target.value)}
                                        placeholder={t('dashboard.subscriptions.broadcast.contentPlaceholder') || 'Write your announcement...'}
                                        rows={6}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-smart-blue focus:outline-none resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleSendBroadcast}
                                        disabled={broadcastLoading || !broadcastSubject.trim() || !broadcastContent.trim()}
                                        className="flex-1"
                                    >
                                        {broadcastLoading
                                            ? (t('dashboard.subscriptions.broadcast.sending') || 'Sending...')
                                            : (t('dashboard.subscriptions.broadcast.send') || 'Send Broadcast')}
                                    </Button>
                                    <Button variant="secondary" onClick={() => setShowBroadcastModal(false)}>
                                        {t('dashboard.subscriptions.broadcast.cancel') || 'Cancel'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageSubscriptions;
