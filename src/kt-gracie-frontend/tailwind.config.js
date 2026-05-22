/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

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
        // ── Primary brand blue ──────────────────────────────────────────
        brand: {
          50:       '#eef7ff',
          100:      '#d0eaff',
          200:      '#b8d8f0',   // secondary / coin gradient start
          300:      '#6ec6f0',   // heart icon fill, health bar accent
          400:      '#5cb8e8',   // health bar fill start
          500:      '#4a98d4',   // primary DEFAULT
          600:      '#3a9ad9',   // health bar fill end, CTA hover
          700:      '#6aafe0',   // primary dark / coin gradient mid
          800:      '#3898d8',   // border accent
          900:      '#1a3d5c',   // ink-deep / badge value text
        },

        // ── Ocean UI tones (city badges, header, health bar) ────────────
        ocean: {
          border:   'rgba(56, 152, 216, 0.35)',
          shadow:   'rgba(56, 152, 216, 0.12)',
          track:    '#c8dce8',   // health bar track background
          label:    '#6b8faa',   // badge label text
          heading:  '#3a6d8c',   // health label text
          header:   'rgba(214, 238, 254, 0.85)', // city header gradient start
        },

        // ── Text / ink hierarchy ────────────────────────────────────────
        ink: {
          deep:     '#1a3d5c',   // primary text on light bg
          mid:      '#3a6d8c',   // secondary text
          muted:    '#6b8faa',   // tertiary / labels
          subtle:   '#94a3b8',   // placeholder / disabled
        },

        // ── Surface / glass ─────────────────────────────────────────────
        surface: {
          glass:    'rgba(255, 255, 255, 0.85)',
          'glass-blue': 'rgba(235, 245, 255, 0.92)',
          white:    '#ffffff',
          page:     '#f8fafc',   // app background
          card:     '#ffffff',
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
      },
      animation: {
        float:          'float 6s ease-in-out infinite',
        'float-reverse':'float-reverse 8s ease-in-out infinite',
        'float-slow':   'float-slow 10s ease-in-out infinite',
        fadeSlideDown:  'fadeSlideDown 0.6s ease-out both',
        cityReveal:     'cityReveal 0.8s ease-out both',
        pulseScale:     'pulseScale 2s ease-in-out infinite',
      },
    },
  },

  plugins: [],
};
