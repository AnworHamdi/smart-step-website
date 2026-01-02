import React, { useState, useEffect, useCallback, useRef } from 'react';
import { listMedia, uploadMedia, deleteMedia } from '../../lib/apiClient';
import { useTranslation } from '../../hooks/useTranslation';
import Card from '../ui/Card';
import { MiniSpinner } from '../ui/Icons';

interface MediaItem {
    id: number;
    filename: string;
    original_name: string;
    path: string;
    url: string;
    mime_type: string;
    size: number;
    alt_text: string | null;
    created_at: string;
}

const ManageMedia: React.FC = () => {
    const { t } = useTranslation();
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadMedia = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await listMedia('image');
            setMedia(response.data || []);
        } catch (err: any) {
            console.error('Failed to load media:', err);
            setError('Failed to load media library');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMedia();
    }, [loadMedia]);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const validFiles = Array.from(files).filter(file => {
            if (!file.type.startsWith('image/')) {
                setError(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError(`${file.name} exceeds 10MB limit`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            let uploaded = 0;
            for (const file of validFiles) {
                const result = await uploadMedia(file);
                if (result.media) {
                    setMedia(prev => [result.media, ...prev]);
                }
                uploaded++;
                setUploadProgress(Math.round((uploaded / validFiles.length) * 100));
            }
            setSuccess(`Successfully uploaded ${validFiles.length} image(s)`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Upload failed');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleUpload(e.dataTransfer.files);
    };

    const handleDelete = async (item: MediaItem) => {
        if (!window.confirm(`Delete "${item.original_name}"?`)) return;

        try {
            await deleteMedia(item.id);
            setMedia(prev => prev.filter(m => m.id !== item.id));
            setSuccess('Image deleted successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Delete failed:', err);
            setError('Failed to delete image');
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    📁 Media Library
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {media.length} {media.length === 1 ? 'image' : 'images'} uploaded
                </p>
            </div>

            {/* Upload Area */}
            <div
                className={`mb-6 p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${dragActive
                        ? 'border-smart-blue bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="text-center">
                    {isUploading ? (
                        <div className="space-y-3">
                            <MiniSpinner className="w-10 h-10 mx-auto text-smart-blue" />
                            <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                                <div
                                    className="h-full bg-smart-blue transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
                        </div>
                    ) : (
                        <>
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
                                Drag and drop images here, or <span className="text-smart-blue font-medium">browse</span>
                            </p>
                            <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF, WebP (max 10MB each)</p>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            handleUpload(e.target.files);
                            e.target.value = '';
                        }}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                </div>
            )}

            {/* Media Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <MiniSpinner className="w-10 h-10 text-smart-blue" />
                </div>
            ) : media.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg mb-1">No images uploaded yet</p>
                    <p>Upload your first image above to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {media.map((item) => (
                        <div
                            key={item.id}
                            className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                        >
                            <div className="aspect-square">
                                <img
                                    src={item.url}
                                    alt={item.alt_text || item.original_name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>

                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(item.url)}
                                    className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-all"
                                    title="Copy URL"
                                >
                                    {copiedUrl === item.url ? (
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                                    title="Delete"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                            {/* File info */}
                            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={item.original_name}>
                                    {item.original_name}
                                </p>
                                <p className="text-xs text-gray-400">{formatFileSize(item.size)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default ManageMedia;
