import React, { useState, useEffect, useCallback, useRef } from 'react';
import { listMedia, uploadMedia, deleteMedia } from '../../lib/apiClient';
import { MiniSpinner } from './Icons';

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

interface MediaPickerProps {
    value: string;
    onChange: (url: string) => void;
    onClose: () => void;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ value, onChange, onClose }) => {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [selectedUrl, setSelectedUrl] = useState<string>(value);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const loadMedia = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await listMedia('image');
            if (isMountedRef.current) {
                setMedia(response.data || []);
            }
        } catch (err) {
            console.error('Failed to load media:', err);
            if (isMountedRef.current) {
                setError('Failed to load media library');
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadMedia();
    }, [loadMedia]);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);
            setError(null);

            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            const result = await uploadMedia(file);

            clearInterval(progressInterval);

            if (isMountedRef.current && result.media) {
                setUploadProgress(100);
                setMedia(prev => [result.media, ...prev]);
                setSelectedUrl(result.media.url);
            }
        } catch (err: any) {
            console.error('Upload failed:', err);
            if (isMountedRef.current) {
                setError(err.message || 'Upload failed');
            }
        } finally {
            if (isMountedRef.current) {
                setIsUploading(false);
                setUploadProgress(0);
            }
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

    const handleSelect = (item: MediaItem) => {
        setSelectedUrl(item.url);
    };

    const handleConfirm = () => {
        if (selectedUrl) {
            onChange(selectedUrl);
        }
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const handleDelete = async (id: number, url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            await deleteMedia(id);
            if (isMountedRef.current) {
                setMedia(prev => prev.filter(m => m.id !== id));
                if (selectedUrl === url) {
                    setSelectedUrl('');
                }
            }
        } catch (err) {
            console.error('Delete failed:', err);
            if (isMountedRef.current) {
                setError('Failed to delete image');
            }
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Prevent scroll on body when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleCancel();
            }}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Media Library</h2>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Upload Area */}
                <div
                    className={`m-4 p-6 border-2 border-dashed rounded-lg transition-colors ${dragActive
                            ? 'border-smart-blue bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        {isUploading ? (
                            <div className="space-y-2">
                                <MiniSpinner className="w-8 h-8 mx-auto text-smart-blue" />
                                <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                                    <div
                                        className="h-full bg-smart-blue transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500">Uploading...</p>
                            </div>
                        ) : (
                            <>
                                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    Drag and drop an image here, or{' '}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-smart-blue hover:underline font-medium"
                                    >
                                        browse
                                    </button>
                                </p>
                                <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP (max 10MB)</p>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                handleUpload(e.target.files);
                                // Reset input value to allow selecting the same file again
                                e.target.value = '';
                            }}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Media Grid */}
                <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <MiniSpinner className="w-8 h-8 text-smart-blue" />
                        </div>
                    ) : media.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>No images uploaded yet</p>
                            <p className="text-sm">Upload your first image above</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {media.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedUrl === item.url
                                            ? 'border-smart-blue ring-2 ring-smart-blue ring-opacity-50'
                                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                                        <img
                                            src={item.url}
                                            alt={item.alt_text || item.original_name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={(e) => handleDelete(item.id, item.url, e)}
                                            className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Selection indicator */}
                                    {selectedUrl === item.url && (
                                        <div className="absolute top-2 right-2 bg-smart-blue text-white rounded-full p-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* File info */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs truncate">{item.original_name}</p>
                                        <p className="text-gray-300 text-xs">{formatFileSize(item.size)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {media.length} {media.length === 1 ? 'image' : 'images'} in library
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!selectedUrl}
                            className="px-4 py-2 text-sm font-medium text-white bg-smart-blue rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Select Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaPicker;
