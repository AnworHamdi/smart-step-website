import { useState, useCallback } from 'react';
import { apiRequest } from '../lib/apiClient';

// Simple language detection: checks for the presence of Arabic characters.
const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

/**
 * A custom hook to provide real-time text translation using the backend Gemini proxy.
 * Returns a stable `translate` function and a boolean `isTranslating` loading state.
 */
export const useAutoTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = useCallback(async (text: string, context: string): Promise<string> => {
    // Runtime Guard: Don't call the API for empty or whitespace-only strings.
    if (!text.trim()) {
      return '';
    }

    setIsTranslating(true);
    try {
      // Call backend translation proxy instead of calling Gemini directly from frontend
      // This keeps the API key secure on the server.
      const response = await apiRequest('/translate', {
        method: 'POST',
        body: JSON.stringify({ text, context }),
      });

      if (!response.ok) {
        throw new Error('Translation request failed');
      }

      const data = await response.json();
      return data.translated_text || '';
    } catch (error) {
      console.error("Translation Hook Error:", error);
      return ''; // Return empty string on error to prevent overwriting with bad data
    } finally {
      setIsTranslating(false);
    }
  }, []);

  return { translate, isTranslating };
};