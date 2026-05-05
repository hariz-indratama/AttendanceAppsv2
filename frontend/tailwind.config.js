/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map Tailwind utilities → CSS design tokens from main.css
        bg: {
          primary:   'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card:      'var(--bg-card)',
          cardAlt:   'var(--bg-card-alt)',
          sidebar:   'var(--bg-sidebar)',
        },
        border: {
          DEFAULT:  'var(--border)',
          strong:   'var(--border-strong)',
          card:     'var(--border-card)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary:'var(--text-secondary)',
          muted:     'var(--text-muted)',
        },
        // Standard gray scale mapped to design tokens for compatibility
        gray: {
          50:  'var(--bg-secondary)',
          100: 'var(--bg-card-alt)',
          200: 'var(--border)',
          300: 'var(--border-strong)',
          400: 'var(--text-muted)',
          500: 'var(--text-secondary)',
          600: 'var(--text-secondary)',
          700: 'var(--text-primary)',
          800: 'var(--text-primary)',
          900: 'var(--text-primary)',
        },
        // Status semantic colors
        success: {
          DEFAULT:  'var(--success)',
          muted:    'var(--success-muted)',
          text:     'var(--success-text)',
          border:   'var(--success-border)',
        },
        warning: {
          DEFAULT:  '#d97706',
          muted:    'rgba(217, 119, 6, 0.08)',
          text:     '#92400e',
          border:   'rgba(217, 119, 6, 0.25)',
        },
        danger: {
          DEFAULT:  'var(--danger)',
          muted:    'var(--danger-muted)',
          text:     'var(--danger-text)',
          border:   'var(--danger-border)',
        },
        disabled: {
          DEFAULT: 'var(--disabled)',
          text:    'var(--disabled-text)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          hover:      'var(--accent-hover)',
          muted:      'var(--accent-muted)',
          glow:       'var(--accent-glow)',
          border:     'var(--accent-border)',
          admin:      'var(--accent-admin)',
          'admin-hover':  'var(--accent-admin-hover)',
          'admin-muted':  'var(--accent-admin-muted)',
          'admin-glow':   'var(--accent-admin-glow)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
        mono:    ['var(--font-mono)'],
      },
      borderRadius: {
        xs:  'var(--radius-xs)',
        sm:  'var(--radius-sm)',
        md:  'var(--radius-md)',
        lg:  'var(--radius-lg)',
        xl:  'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm:     'var(--shadow-sm)',
        md:     'var(--shadow-md)',
        lg:     'var(--shadow-lg)',
        card:   'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        focus:  'var(--shadow-input-focus)',
      },
      backgroundColor: {
        skeleton:  'var(--skeleton-base)',
        'skeleton-shine': 'var(--skeleton-shine)',
      },
    },
  },
  plugins: [],
}