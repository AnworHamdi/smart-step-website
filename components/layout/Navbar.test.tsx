// Fix: Import jest globals to make test functions available.
import { describe, test, expect } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import Navbar from './Navbar';
import { LanguageProvider } from '../../contexts/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </LanguageProvider>
  );
};

describe('Navbar component', () => {
  test('renders logo and navigation links', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText(/SMART/i)).toBeInTheDocument();
    expect(screen.getByText(/STEP/i)).toBeInTheDocument();
    
    // In AR (default)
    expect(screen.getByRole('link', { name: /الرئيسية/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /من نحن/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /خدماتنا/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /المدونة/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /اتصل بنا/i })).toBeInTheDocument();
  });

  test('language toggle button switches language', () => {
    renderWithProviders(<Navbar />);
    
    // Initial language is Arabic
    const langButton = screen.getByRole('button', { name: /english/i });
    expect(langButton).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'الرئيسية' })).toBeInTheDocument();

    // Switch to English
    fireEvent.click(langButton);
    expect(screen.getByRole('button', { name: /العربية/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument();


    // Switch back to Arabic
    fireEvent.click(screen.getByRole('button', { name: /العربية/i }));
    expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'الرئيسية' })).toBeInTheDocument();
  });

  test('mobile menu opens and closes', () => {
    renderWithProviders(<Navbar />);

    const openMenuButton = screen.getByLabelText(/open menu/i);
    expect(openMenuButton).toBeInTheDocument();
    
    // Initially, only one "Home" link (desktop) should be in the document
    expect(screen.getAllByRole('link', {name: /الرئيسية/i}).length).toBe(1);

    // Open the menu
    fireEvent.click(openMenuButton);

    // Menu is open, check for close button
    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
    
    // Now both desktop and mobile "Home" links should be present
    expect(screen.getAllByRole('link', {name: /الرئيسية/i}).length).toBe(2);

    // Click a mobile link to close menu
    const mobileHomeLink = screen.getAllByRole('link', { name: /الرئيسية/i })[1];
    fireEvent.click(mobileHomeLink);
    
    // Menu should be closed, back to one "Home" link
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/close menu/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', {name: /الرئيسية/i}).length).toBe(1);
  });
});