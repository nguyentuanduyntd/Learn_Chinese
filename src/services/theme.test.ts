import { afterEach, describe, expect, it } from 'vitest';
import { applyTheme, resolveTheme } from './theme';

/** jsdom không có matchMedia → giả lập một MediaQueryList tối giản, có thể đổi trạng thái. */
function mockSystemDark(initial: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: initial,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => media as unknown as MediaQueryList,
  });
  return {
    listenerCount: () => listeners.size,
    set(dark: boolean) {
      media.matches = dark;
      listeners.forEach((listener) => listener());
    },
  };
}

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia');
  delete document.documentElement.dataset.theme;
});

describe('resolveTheme', () => {
  it('cài đặt cố định thắng hệ thống', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('"system" theo hệ điều hành', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});

describe('applyTheme', () => {
  it('gắn data-theme và đổi theo hệ thống khi để "system"', () => {
    const system = mockSystemDark(false);
    const stop = applyTheme('system');
    expect(document.documentElement.dataset.theme).toBe('light');
    system.set(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
    stop();
    expect(system.listenerCount()).toBe(0);
  });

  it('cài đặt cố định không theo dõi hệ thống', () => {
    const system = mockSystemDark(true);
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(system.listenerCount()).toBe(0);
  });

  it('không có matchMedia → mặc định sáng', () => {
    applyTheme('system');
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
