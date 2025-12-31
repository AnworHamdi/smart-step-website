// Fix: Import jest globals to make test functions available.
import { describe, test, expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import Button from './Button';

describe('Button component', () => {
  test('renders correctly with children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders as a link when "to" prop is provided', () => {
    render(
      <MemoryRouter>
        <Button to="/home">Go Home</Button>
      </MemoryRouter>
    );
    const linkElement = screen.getByRole('link', { name: /go home/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/home');
  });

  test('applies primary variant classes by default', () => {
    render(<Button>Primary Button</Button>);
    expect(screen.getByRole('button', { name: /primary button/i })).toHaveClass('bg-gradient-to-r');
  });

  test('applies secondary variant classes when specified', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button', { name: /secondary button/i });
    expect(button).toHaveClass('bg-white text-smart-blue border-2 border-smart-blue');
    expect(button).not.toHaveClass('bg-gradient-to-r');
  });
});