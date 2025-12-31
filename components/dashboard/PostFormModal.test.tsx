// Fix: Import `afterEach` from jest globals to resolve TypeScript error.
import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataProvider } from '../../contexts/DataContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import PostFormModal from './PostFormModal';

// Mock the translation hook
const mockTranslate = jest.fn();
jest.mock('../../hooks/useAutoTranslation', () => ({
  useAutoTranslation: () => ({
    translate: mockTranslate,
  }),
}));

const AllTheProviders: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <LanguageProvider>
      <DataProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </DataProvider>
    </LanguageProvider>
  );
};

const renderComponent = () => {
  return render(
    <PostFormModal isOpen={true} onClose={() => {}} post={null} />,
    { wrapper: AllTheProviders }
  );
};

describe('PostFormModal with Auto-Translation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockTranslate.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should call translate function after user stops typing in an English field', async () => {
    mockTranslate.mockResolvedValue('مرحبا');
    renderComponent();

    const titleEnInput = screen.getByLabelText('Title (English)');
    fireEvent.change(titleEnInput, { target: { value: 'Hello' } });

    // Should not be called immediately
    expect(mockTranslate).not.toHaveBeenCalled();

    // Fast-forward time by 800ms
    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(mockTranslate).toHaveBeenCalledTimes(1);
    });
    expect(mockTranslate).toHaveBeenCalledWith('Hello', 'a blog post title');
  });
  
  test('should update the Arabic field with the translated text', async () => {
    const translatedText = 'عنوان مترجم';
    mockTranslate.mockResolvedValue(translatedText);
    renderComponent();

    const titleEnInput = screen.getByLabelText('Title (English)');
    const titleArInput = screen.getByLabelText('Title (Arabic)');

    fireEvent.change(titleEnInput, { target: { value: 'A translated title' } });

    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(titleArInput).toHaveValue(translatedText);
    });
  });

  test('should show and hide spinner during translation', async () => {
    let resolvePromise: (value: string) => void;
    const promise = new Promise<string>(resolve => {
        resolvePromise = resolve;
    });
    mockTranslate.mockReturnValue(promise);

    renderComponent();

    const titleEnInput = screen.getByLabelText('Title (English)');
    fireEvent.change(titleEnInput, { target: { value: 'Testing spinner' } });

    act(() => {
      jest.advanceTimersByTime(800);
    });

    // Use queryByTestId because it might not be there initially
    await waitFor(() => {
        const spinner = screen.queryByRole('status'); // MiniSpinner has no explicit role, it's just an svg
        expect(spinner).toBeInTheDocument();
    });
    
    await act(async () => {
        resolvePromise!('تم اختبار الدوار');
        await promise; // Ensure promise is fully resolved
    });
    
    await waitFor(() => {
       const spinner = screen.queryByRole('status');
       expect(spinner).not.toBeInTheDocument();
    });
  });

  test('should debounce translation calls', async () => {
    renderComponent();
    
    const excerptEnInput = screen.getByLabelText('Excerpt (English)');
    
    fireEvent.change(excerptEnInput, { target: { value: 'first' } });
    act(() => { jest.advanceTimersByTime(400); });
    
    fireEvent.change(excerptEnInput, { target: { value: 'first second' } });
    act(() => { jest.advanceTimersByTime(400); });
    
    fireEvent.change(excerptEnInput, { target: { value: 'first second third' } });
    
    // API should not have been called yet
    expect(mockTranslate).not.toHaveBeenCalled();

    // Fast-forward to trigger the last debounce
    act(() => { jest.advanceTimersByTime(800); });

    await waitFor(() => {
      expect(mockTranslate).toHaveBeenCalledTimes(1);
      expect(mockTranslate).toHaveBeenCalledWith('first second third', 'a blog post excerpt');
    });
  });
  
  test('should not overwrite manual input in target field', async () => {
    const translatedText = 'تمت الكتابة فوقها';
    mockTranslate.mockResolvedValue(translatedText);
    renderComponent();

    const titleEnInput = screen.getByLabelText('Title (English)');
    const titleArInput = screen.getByLabelText('Title (Arabic)');

    // User types in English field, translation is triggered
    fireEvent.change(titleEnInput, { target: { value: 'Overwrite this' } });
    
    // Before translation returns, user types manually in Arabic field
    fireEvent.change(titleArInput, { target: { value: 'إدخال يدوي' } });

    // Advance timers for translation to complete
    act(() => {
      jest.advanceTimersByTime(800);
    });

    // Wait for the async translation logic to finish
    await act(async () => {
      await Promise.resolve();
    });
    
    // The value should remain the manual input, not the returned translation
    expect(titleArInput).toHaveValue('إدخال يدوي');
  });

});