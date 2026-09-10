/**
 * Colour tokens resolve through CSS custom properties defined in
 * src/styles/theme.css, so the light/dark themes and the accent picker in
 * Settings can repaint the whole app without touching component classes.
 *
 * Each variable holds a bare "R G B" triplet, which keeps Tailwind's alpha
 * modifiers (`bg-brand-500/20`) working.
 */
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  darkMode: ['class', '[data-theme="dark"]'],

  theme: {
    // ── Brand fonts ────────────────────────────────────────────────────────
    fontFamily: {
      sans:  ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      hand:  ['"Gochi Hand"', 'cursive'],
      mono:  ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
    },

    // ── Brand spacing scale (extends default, not replaces) ────────────────
    extend: {
      spacing: {
        // Component-level tokens
        'badge-x':  '22px',   // horizontal padding on city badge pills
        'badge-y':  '10px',   // vertical padding on city badge pills
        'header-t': '18px',   // city header top padding
        'section':  '72px',   // page section vertical gap
        'card':     '40px',   // card internal padding (desktop)
        'card-sm':  '24px',   // card internal padding (mobile)
      },

      // ── Brand border-radius ──────────────────────────────────────────────
      borderRadius: {
        pill:  '40px',   // badge pills
        card:  '20px',   // content cards
        badge: '12px',   // small inline badges
      },

      // ── Brand colour palette ─────────────────────────────────────────────
      //
      // Naming convention:
      //   brand-*   → primary blue identity colours
      //   ocean-*   → city / water UI tones (badges, health bar, header)
      //   ink-*     → text hierarchy
      //   surface-* → background / glass surfaces
      //   success / warning / danger → semantic
      //
      colors: {
        // ── Primary brand blue (accent-driven — see theme.css) ──────────
        brand: {
          50:       token('--brand-50'),
          100:      token('--brand-100'),
          200:      token('--brand-200'),   // secondary / coin gradient start
          300:      token('--brand-300'),   // heart icon fill, health bar accent
          400:      token('--brand-400'),   // health bar fill start
          500:      token('--brand-500'),   // primary DEFAULT
          600:      token('--brand-600'),   // health bar fill end, CTA hover
          700:      token('--brand-700'),   // primary dark / coin gradient mid
          800:      token('--brand-800'),   // border accent
          900:      token('--brand-900'),   // ink-deep / badge value text
        },

        // ── Ocean UI tones (city badges, header, health bar) ────────────
        ocean: {
          border:   'var(--ocean-border)',
          shadow:   'var(--ocean-shadow)',
          track:    token('--ocean-track'),   // health bar track background
          label:    token('--ocean-label'),   // badge label text
          heading:  token('--ocean-heading'), // health label text
          header:   'var(--ocean-header)',    // city header gradient start
        },

        // ── Text / ink hierarchy ────────────────────────────────────────
        ink: {
          deep:     token('--ink-deep'),     // primary text on the page surface
          mid:      token('--ink-mid'),      // secondary text
          muted:    token('--ink-muted'),    // tertiary / labels
          subtle:   token('--ink-subtle'),   // placeholder / disabled
        },

        // ── Surface / glass ─────────────────────────────────────────────
        surface: {
          glass:    token('--surface-glass'),
          'glass-blue': token('--surface-glass-blue'),
          white:    token('--surface-white'),
          page:     token('--surface-page'),   // app background
          card:     token('--surface-card'),
          muted:    token('--surface-muted'),  // inset rows, tracks, wells
          raised:   token('--surface-raised'), // hovered/selected rows
        },

        // ── Hairlines ───────────────────────────────────────────────────
        line: {
          soft:     token('--line-soft'),
          strong:   token('--line-strong'),
        },

        // ── Semantic ────────────────────────────────────────────────────
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50:  '#fffbeb',
          300: '#fcd34d',
          400: '#fbbf24',
        },
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
      },

      // ── Typography scale ─────────────────────────────────────────────────
      fontSize: {
        'badge-label': ['11px', { lineHeight: '1', letterSpacing: '0.6px', fontWeight: '500' }],
        'badge-value': ['16px', { lineHeight: '1.25', fontWeight: '700' }],
        'coin-label':  ['12px', { lineHeight: '1', letterSpacing: '1px',  fontWeight: '800' }],
      },

      // ── Box shadows ──────────────────────────────────────────────────────
      boxShadow: {
        badge:    '0 4px 14px rgba(56,152,216,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
        'badge-hover': '0 6px 20px rgba(56,152,216,0.22), inset 0 1px 0 rgba(255,255,255,0.7)',
        coin:     '0 2px 8px rgba(74,152,212,0.35), inset 0 1px 2px rgba(255,255,255,0.4)',
        card:     '0 4px 24px rgba(0,0,0,0.08)',
        'card-lg':'0 8px 40px rgba(0,0,0,0.12)',
      },

      // ── Backdrop blur ────────────────────────────────────────────────────
      backdropBlur: {
        badge: '10px',
      },

      // ── Keyframes & animations ───────────────────────────────────────────
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(20px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%':      { transform: 'translateY(-10px) translateX(10px)' },
        },
        fadeSlideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        cityReveal: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.05)' },
        },
        spiralRing: {
          '0%':   { transform: 'scale(0.6)', opacity: '0.8' },
          '80%':  { transform: 'scale(2.6)', opacity: '0.15' },
          '100%': { transform: 'scale(2.8)', opacity: '0' },
        },
      },
      animation: {
        float:          'float 6s ease-in-out infinite',
        'float-reverse':'float-reverse 8s ease-in-out infinite',
        'float-slow':   'float-slow 10s ease-in-out infinite',
        fadeSlideDown:  'fadeSlideDown 0.6s ease-out both',
        cityReveal:     'cityReveal 0.8s ease-out both',
        pulseScale:     'pulseScale 2s ease-in-out infinite',
        spiralRing:     'spiralRing 1.8s ease-out infinite',
      },
    },
  },

  plugins: [],
};
