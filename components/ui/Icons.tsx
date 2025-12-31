import React from 'react';

type IconProps = {
  className?: string;
};

const SvgIcon: React.FC<IconProps & { path: React.ReactNode; viewBox?: string; fill?: string; stroke?: string, strokeWidth?: number }> = ({ className, path, viewBox = "0 0 24 24", fill = "none", stroke = "currentColor", strokeWidth = 2 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 ${className}`}
    fill={fill}
    viewBox={viewBox}
    stroke={stroke}
    strokeWidth={strokeWidth}
    aria-hidden="true"
    focusable="false"
  >
    {path}
  </svg>
);

export const NetworkIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M12 21.646a4 4 0 100-5.292M12 12.82a4 4 0 110-5.292M19.646 12a4 4 0 10-5.292-5.292M4.354 12a4 4 0 115.292 5.292" /></>} />;
export const ShieldIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></>} />;
export const CodeIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></>} />;
export const BookOpenIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></>} />;
export const LifeBuoyIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></>} />;
export const TrendingUpIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></>} />;

export const MailIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></>} />;
export const PhoneIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></>} />;
export const MapPinIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>} />;
export const CheckIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></>} />;

export const LoadingSpinner: React.FC<IconProps> = ({ className }) => (
  <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-label="Loading...">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
export const MiniSpinner: React.FC<IconProps> = ({ className }) => <LoadingSpinner className={className} />;

export const UsersIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></>} />;
export const TargetIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 10-7.07 7.072m7.07-7.072l-2.122 2.122m-5.656 5.656l-2.12 2.122m7.778-7.778l2.122-2.122m-5.656 5.656l2.12 2.122m7.778-7.778l-2.12 2.122M12 21a9 9 0 100-18 9 9 0 000 18z" /></>} />;
export const AwardIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M7.05 7.05l-1.414-1.414M18.364 18.364l-1.414-1.414M18.364 7.05l-1.414 1.414M7.05 18.364l1.414-1.414" /></>} />;
export const LanguageIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m0 0a9 9 0 019-9m-9 9a9 9 0 009 9" /></>} />;

export const MenuIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></>} />;
export const XIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></>} />;
export const TrashIcon: React.FC<IconProps> = ({ className }) => <SvgIcon className={className} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></>} />;

