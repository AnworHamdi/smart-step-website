import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { GoogleGenAI } from '@google/genai';
import { useAutoTranslation } from './useAutoTranslation';

// Mock the @google/genai library
jest.mock('@google/genai');

const mockGenerateContent = jest.fn();
const mockGoogleGenAI = GoogleGenAI as jest.Mock;

mockGoogleGenAI.mockImplementation(() => ({
  models: {
    generateContent: mockGenerateContent,
  },
}));

describe('useAutoTranslation hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env mock for each test
    process.env = { ...process.env, API_KEY: 'test-api-key' };
  });

  test('should initialize with isTranslating as false', () => {
    const { result } = renderHook(() => useAutoTranslation());
    expect(result.current.isTranslating).toBe(false);
  });

  test('should not call API if input text is empty or whitespace', async () => {
    const { result } = renderHook(() => useAutoTranslation());
    
    let translatedText = '';
    await act(async () => {
      translatedText = await result.current.translate('', 'test context');
    });
    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(translatedText).toBe('');

    await act(async () => {
      translatedText = await result.current.translate('   ', 'test context');
    });
    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(translatedText).toBe('');
  });

  test('should set isTranslating to true during API call and false after', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'Translated Text' });
    const { result } = renderHook(() => useAutoTranslation());

    const promise = act(async () => {
      await result.current.translate('Hello', 'greeting');
    });

    // isTranslating should be true immediately after calling
    expect(result.current.isTranslating).toBe(true);
    
    await promise;

    // isTranslating should be false after the promise resolves
    expect(result.current.isTranslating).toBe(false);
  });

  test('should call Gemini API with correct prompt for English to Arabic translation', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'مرحباً' });
    const { result } = renderHook(() => useAutoTranslation());

    await act(async () => {
      await result.current.translate('Hello', 'a blog post title');
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const calledWith = mockGenerateContent.mock.calls[0][0];
    expect(calledWith.model).toBe('gemini-2.5-flash');
    expect(calledWith.contents).toContain('Translate the following text from English to Arabic.');
    expect(calledWith.contents).toContain('The context is: "a blog post title".');
    expect(calledWith.contents).toContain('Text: "Hello"');
  });

  test('should call Gemini API with correct prompt for Arabic to English translation', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'Welcome' });
    const { result } = renderHook(() => useAutoTranslation());
    
    await act(async () => {
      await result.current.translate('أهلاً', 'a welcome message');
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const calledWith = mockGenerateContent.mock.calls[0][0];
    expect(calledWith.contents).toContain('Translate the following text from Arabic to English.');
    expect(calledWith.contents).toContain('The context is: "a welcome message".');
    expect(calledWith.contents).toContain('Text: "أهلاً"');
  });

  test('should return translated text on success', async () => {
    const mockResponse = 'مرحباً بالعالم';
    mockGenerateContent.mockResolvedValue({ text: `  ${mockResponse}  ` }); // Test trimming
    const { result } = renderHook(() => useAutoTranslation());
    
    let translatedText = '';
    await act(async () => {
      translatedText = await result.current.translate('Hello World', 'test');
    });

    expect(translatedText).toBe(mockResponse);
  });
  
  test('should return an empty string and log error on API failure', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const apiError = new Error('API limit reached');
    mockGenerateContent.mockRejectedValue(apiError);
    const { result } = renderHook(() => useAutoTranslation());

    let translatedText = 'should be cleared';
    await act(async () => {
      translatedText = await result.current.translate('Some text', 'test');
    });
    
    expect(translatedText).toBe('');
    expect(result.current.isTranslating).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Gemini Translation API Error:", expect.objectContaining({
        errorMessage: 'API limit reached'
    }));

    consoleErrorSpy.mockRestore();
  });
});
