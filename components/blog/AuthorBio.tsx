import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface AuthorBioProps {
    name: string;
    avatar?: string;
}

const AuthorBio: React.FC<AuthorBioProps> = ({ name, avatar }) => {
    const { t } = useTranslation();

    // Generate initials from name
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-800">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={name}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100 dark:ring-zinc-700"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-smart-blue to-smart-green flex items-center justify-center text-white font-bold text-xl">
                            {initials}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        Written by
                    </p>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        A passionate writer and technology enthusiast sharing insights on the latest trends in IT and digital transformation.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthorBio;
