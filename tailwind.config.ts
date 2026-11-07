import type { Config } from 'tailwindcss';

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        surface2: token('surface-2'),
        line: token('line'),
        primary: token('primary'),
        'primary-dark': token('primary-dark'),
        accent: token('accent'),
        'accent-dark': token('accent-dark'),
        success: token('success'),
        'success-dark': token('success-dark'),
        error: token('error'),
        'error-dark': token('error-dark'),
        text: token('text'),
        muted: token('muted'),
        tone1: '#E63946',
        tone2: '#F4A261',
        tone3: '#2A9D8F',
        tone4: '#457B9D',
        tone5: '#8C7B6B',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        han: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', '"Hiragino Sans GB"', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        btn: '16px',
      },
      maxWidth: {
        app: '480px',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        shake: 'shake 300ms ease-in-out',
        pop: 'pop 300ms ease-out',
        floaty: 'floaty 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
