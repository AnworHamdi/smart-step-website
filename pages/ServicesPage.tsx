
import React, { useContext } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  NetworkIcon,
  ShieldIcon,
  CodeIcon,
  BookOpenIcon,
  LifeBuoyIcon,
  TrendingUpIcon,
  UsersIcon,
  TargetIcon,
  AwardIcon,
} from '../components/ui/Icons';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useSeo } from '../hooks/useSeo';
import { DataContext } from '../contexts/DataContext';
import ServiceCardSkeleton from '../components/ui/ServiceCardSkeleton';
import Skeleton from '../components/ui/Skeleton';

const serviceDetails = [
  { key: 'infrastructure', icon: <NetworkIcon /> },
  { key: 'security', icon: <ShieldIcon /> },
  { key: 'development', icon: <CodeIcon /> },
  { key: 'consulting', icon: <BookOpenIcon /> },
  { key: 'support', icon: <LifeBuoyIcon /> },
  { key: 'marketing', icon: <TrendingUpIcon /> },
];

const advantages = [
  { key: 'advantage1', icon: <UsersIcon /> },
  { key: 'advantage2', icon: <TargetIcon /> },
  { key: 'advantage3', icon: <AwardIcon /> },
];

const ServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const { loading } = useContext(DataContext);
  useSeo(t('services.title'), t('servicesPage.heroSubtitle'));

  const servicesListRef = useScrollAnimation<HTMLElement>();
  const whyChooseUsRef = useScrollAnimation<HTMLElement>();
  const ctaSectionRef = useScrollAnimation<HTMLElement>();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-gray-50 dark:from-zinc-900 dark:to-zinc-950 py-20 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center animate-on-scroll is-visible">
          <h1 className="text-4xl md:text-5xl font-extrabold text-smart-blue dark:text-soft-blue leading-tight">
            {t('servicesPage.heroTitle')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('servicesPage.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Services List Section */}
      <section ref={servicesListRef} className="py-20 bg-white dark:bg-zinc-950 animate-on-scroll transition-colors duration-300">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => <ServiceCardSkeleton key={index} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceDetails.map((service, index) => (
                <div key={service.key} className="animate-on-scroll" style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card className="text-center h-full">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-br from-smart-blue to-soft-blue text-white rounded-full">
                        {service.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{t(`services.${service.key}.title` as any)}</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{t(`servicesPage.${service.key}Enhanced` as any)}</p>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section ref={whyChooseUsRef} className="py-20 bg-gray-50 dark:bg-zinc-900 animate-on-scroll transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">{t('servicesPage.whyChooseUsTitle')}</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center">
                  <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-3/4 mx-auto mb-3" />
                  <Skeleton className="h-4 w-full mx-auto" />
                  <Skeleton className="h-4 w-5/6 mx-auto mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {advantages.map((advantage, index) => (
                <div key={advantage.key} className="animate-on-scroll" style={{ transitionDelay: `${index * 100}ms` }}>
                  <div className="text-center">
                    <div className="flex justify-center mb-4 text-smart-green">
                      {advantage.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t(`servicesPage.${advantage.key}Title` as any)}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t(`servicesPage.${advantage.key}Desc` as any)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaSectionRef} className="py-20 bg-white dark:bg-zinc-950 animate-on-scroll transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('servicesPage.ctaTitle')}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">{t('servicesPage.ctaSubtitle')}</p>
          <Button to="/contact">{t('servicesPage.ctaButton')}</Button>
        </div>
      </section>

    </div>
  );
};

export default ServicesPage;
