// Fix: Import jest globals to make test functions available.
import { describe, test, expect, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode, useState } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTranslation } from './useTranslation';

type Language = 'ar' | 'en';

// A custom wrapper that provides the LanguageContext and allows tests to change its value.
// Fix: Add an explicit return type to guide the TypeScript parser and resolve JSX-related errors.
const TestWrapper = ({ children }: { children: ReactNode }): React.ReactElement => {
    const [language, setLanguage] = useState<Language>('ar');
    // Fix: Replace JSX with React.createElement in .ts file to avoid parsing errors.
    return React.createElement(LanguageContext.Provider, { value: { language, setLanguage } }, children);
};

describe('useTranslation hook', () => {
  test('should return translation function and default language', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper: TestWrapper });

    expect(result.current.language).toBe('ar');
    expect(typeof result.current.t).toBe('function');
  });

  test('should return correct translation for a given key in default language (Arabic)', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper: TestWrapper });

    expect(result.current.t('nav.home')).toBe('الرئيسية');
    expect(result.current.t('hero.title')).toBe('حلول تقنية مبتكرة لمستقبل رقمي');
  });

  test('should return key and warn for a non-existent key', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useTranslation(), { wrapper: TestWrapper });
    
    const nonExistentKey = 'non.existent.key';
    expect(result.current.t(nonExistentKey as any)).toBe(nonExistentKey);
    expect(consoleWarnSpy).toHaveBeenCalledWith(`Translation key not found: ${nonExistentKey}`);

    consoleWarnSpy.mockRestore();
  });
  
  test('should switch language and provide correct translations', () => {
    // We render both the hook and its context to gain access to the `setLanguage` function.
    const { result } = renderHook(() => {
        return {
            translation: useTranslation(),
            context: React.useContext(LanguageContext)
        };
    }, { wrapper: TestWrapper });

    // Initial state: Arabic
    expect(result.current.translation.language).toBe('ar');
    expect(result.current.translation.t('nav.home')).toBe('الرئيسية');
    
    // Change language to English using the context setter
    act(() => {
      result.current.context.setLanguage('en');
    });

    // After language change: English
    expect(result.current.translation.language).toBe('en');
    expect(result.current.translation.t('nav.home')).toBe('Home');
    expect(result.current.translation.t('hero.title')).toBe('Innovative Tech Solutions for a Digital Future');

    // Change back to Arabic
    act(() => {
        result.current.context.setLanguage('ar');
    });
    
    expect(result.current.translation.language).toBe('ar');
    expect(result.current.translation.t('nav.home')).toBe('الرئيسية');
  });
});