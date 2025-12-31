

import React, { useContext } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { TargetIcon, AwardIcon } from '../components/ui/Icons';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useSeo } from '../hooks/useSeo';
import { DataContext } from '../contexts/DataContext';
import Skeleton from '../components/ui/Skeleton';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const { teamMembers, loading } = useContext(DataContext);
  useSeo(t('aboutPage.heroTitle'), t('aboutPage.heroSubtitle'));

  const storySectionRef = useScrollAnimation<HTMLElement>();
  const visionMissionSectionRef = useScrollAnimation<HTMLElement>();
  const teamSectionRef = useScrollAnimation<HTMLElement>();
  const valuesSectionRef = useScrollAnimation<HTMLElement>();
  const ctaSectionRef = useScrollAnimation<HTMLElement>();

  const values = ['trust', 'creativity', 'credibility', 'teamwork', 'responsibility'];


  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-gray-50 dark:from-zinc-900 dark:to-zinc-950 py-20 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center animate-on-scroll is-visible">
          <h1 className="text-4xl md:text-5xl font-extrabold text-smart-blue dark:text-soft-blue leading-tight">
            {t('aboutPage.heroTitle')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            {t('aboutPage.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section ref={storySectionRef} className="py-20 bg-white dark:bg-zinc-950 animate-on-scroll transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rtl:lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t('aboutPage.storyTitle')}</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('about.content')}</p>
            </div>
            <div className="order-1 lg:order-2 rtl:lg:order-1">
              <img src="https://picsum.photos/seed/journey/800/600" alt="Smart Step Team working" className="rounded-xl shadow-lg w-full h-auto" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section ref={visionMissionSectionRef} className="py-20 bg-gray-50 dark:bg-zinc-900 animate-on-scroll transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <div className="animate-on-scroll" style={{ transitionDelay: `100ms` }}>
              <Card className="text-center h-full">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-smart-green text-white rounded-full">
                    <TargetIcon />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-smart-blue mb-3">{t('about.visionTitle')}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('about.visionContent')}</p>
              </Card>
            </div>
            <div className="animate-on-scroll" style={{ transitionDelay: `200ms` }}>
              <Card className="text-center h-full">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-smart-green text-white rounded-full">
                    <AwardIcon />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-smart-blue mb-3">{t('about.missionTitle')}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('about.missionContent')}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamSectionRef} className="py-20 bg-white dark:bg-zinc-950 animate-on-scroll transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">{t('aboutPage.teamTitle')}</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t('aboutPage.teamSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="text-center">
                  <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-5 w-1/2 mx-auto" />
                </Card>
              ))
            ) : (
              teamMembers.map((member, index) => (
                <div key={member.id} className="animate-on-scroll" style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card className="text-center">
                    <img src={member.imageUrl} alt={t(member.name)} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover ring-4 ring-smart-green/50" loading="lazy" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t(member.name)}</h3>
                    <p className="text-smart-blue dark:text-soft-blue font-semibold">{t(member.role)}</p>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesSectionRef} id="values" className="py-20 bg-gray-50 dark:bg-zinc-900 animate-on-scroll transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">{t('values.title')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div key={value} className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-on-scroll dark:hover:bg-gray-700 transition-all duration-300" style={{ transitionDelay: `${index * 100}ms` }}>
                <h3 className="text-lg font-semibold text-smart-blue dark:text-soft-blue mb-2">{t(`values.${value}` as any)}</h3>
                <p className="text-base text-gray-600 dark:text-gray-400">{t(`values.${value}Desc` as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaSectionRef} className="py-20 bg-white dark:bg-zinc-950 animate-on-scroll transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('aboutPage.ctaTitle')}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">{t('aboutPage.ctaSubtitle')}</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button to="/services">{t('aboutPage.ctaButtonServices')}</Button>
            <Button to="/contact" variant="secondary">{t('aboutPage.ctaButtonContact')}</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
