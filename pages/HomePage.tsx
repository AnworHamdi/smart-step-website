
import React, { useContext } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  NetworkIcon,
  ShieldIcon,
  CodeIcon,
  BookOpenIcon,
  LifeBuoyIcon,
  TrendingUpIcon,
  TargetIcon,
  AwardIcon
} from '../components/ui/Icons';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useSeo } from '../hooks/useSeo';
import { DataContext } from '../contexts/DataContext';
import ServiceCardSkeleton from '../components/ui/ServiceCardSkeleton';

const serviceIcons: { [key: string]: React.ReactNode } = {
  infrastructure: <NetworkIcon />,
  security: <ShieldIcon />,
  development: <CodeIcon />,
  consulting: <BookOpenIcon />,
  support: <LifeBuoyIcon />,
  marketing: <TrendingUpIcon />,
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { loading } = useContext(DataContext);
  useSeo(t('nav.home'), t('hero.subtitle'));

  const aboutSectionRef = useScrollAnimation<HTMLElement>();
  const servicesSectionRef = useScrollAnimation<HTMLElement>();
  const valuesSectionRef = useScrollAnimation<HTMLElement>();

  const serviceKeys = ['infrastructure', 'security', 'development', 'consulting', 'support', 'marketing'];

  const values = ['trust', 'creativity', 'credibility', 'teamwork', 'responsibility'];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-gray-50 dark:from-zinc-900 dark:to-zinc-950 pt-20 pb-28 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center animate-on-scroll is-visible">
          <h1 className="text-4xl md:text-6xl font-extrabold text-smart-blue dark:text-soft-blue leading-tight">
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <p className="mt-4 text-2xl font-bold text-smart-green">
            {t('hero.slogan')}
          </p>
          <div className="mt-8">
            <Button to="/services">{t('hero.cta')}</Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section ref={aboutSectionRef} id="about" className="py-20 bg-white dark:bg-gray-900 animate-on-scroll">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll" style={{ transitionDelay: '200ms' }}>
              <img
                src="https://picsum.photos/seed/about/800/600"
                alt={t('about.title')}
                className="rounded-xl shadow-2xl w-full h-auto object-cover aspect-[4/3]"
                loading="lazy"
              />
            </div>
            <div className="animate-on-scroll" style={{ transitionDelay: '400ms' }}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('about.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {t('about.content')}
              </p>
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-white bg-smart-green p-3 rounded-full shadow">
                    <TargetIcon />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-smart-blue dark:text-soft-blue">{t('about.visionTitle')}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{t('about.visionContent')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-white bg-smart-green p-3 rounded-full shadow">
                    <AwardIcon />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-smart-blue dark:text-soft-blue">{t('about.missionTitle')}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{t('about.missionContent')}</p>
                  </div>
                </div>
              </div>
              <Button to="/about" variant="secondary">{t('blog.readMore')}</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesSectionRef} id="services" className="py-20 bg-gray-100 dark:bg-zinc-900/50 animate-on-scroll transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">{t('services.title')}</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <ServiceCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceKeys.map((key, index) => (
                <div key={key} className="animate-on-scroll" style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card>
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 bg-gradient-to-br from-smart-blue to-soft-blue text-white rounded-full mb-4">
                        {serviceIcons[key]}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t(`services.${key}.title` as any)}</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{t(`services.${key}.desc` as any)}</p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesSectionRef} id="values" className="py-20 bg-gray-50 dark:bg-zinc-900 animate-on-scroll transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">{t('values.title')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {values.map((value, index) => (
              <div key={value} className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-on-scroll border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:bg-gray-700 transition-all duration-300" style={{ transitionDelay: `${index * 100}ms` }}>
                <h3 className="text-xl font-bold text-smart-blue dark:text-soft-blue mb-2">{t(`values.${value}` as any)}</h3>
                <p className="text-base text-gray-600 dark:text-gray-400">{t(`values.${value}Desc` as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
