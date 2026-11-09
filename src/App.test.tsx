import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

beforeEach(() => {
  window.location.hash = '';
});

describe('App', () => {
  it('mở tab Học, có 4 tab điều hướng', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Học' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });

  it('chuyển tab đổi route hash và tiêu đề', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: 'Ôn tập' }));
    expect(window.location.hash).toBe('#/review');
    expect(screen.getByRole('heading', { level: 1, name: 'Ôn tập' })).toBeInTheDocument();
  });
});
