import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Landing from './Landing';

describe('Landing', () => {
  it('renders hero heading and CTA', () => {
    render(<Landing />);
    expect(screen.getByText(/from question to synthesis/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to research/i })).toHaveAttribute('href', '/research');
  });

  it('renders research capabilities section', () => {
    render(<Landing />);
    expect(screen.getByText('Research capabilities')).toBeInTheDocument();
    expect(screen.getByText(/natural language queries/i)).toBeInTheDocument();
    expect(screen.getAllByText(/citation-grounded/i).length).toBeGreaterThan(0);
  });

  it('renders nav links to Research and Vault', () => {
    render(<Landing />);
    const researchLinks = screen.getAllByRole('link', { name: /research/i });
    expect(researchLinks.length).toBeGreaterThan(0);
    const vaultLinks = screen.getAllByRole('link', { name: /vault/i });
    expect(vaultLinks.some((el) => el.getAttribute('href') === '/vault')).toBe(true);
  });
});
