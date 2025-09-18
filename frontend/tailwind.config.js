/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // enable class-based dark mode
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigoPurple: '#8B5CF6',
          blue: '#2563EB',
        },
        neutral: {
          background: '#F9FAFB',
          surface: '#FFFFFF',
          border: '#E5E7EB',
          textPrimary: '#111827',
          textSecondary: '#6B7280',
        },
        semantic: {
          success: '#10B981',
          warning: '#F97316',
          error:   '#EF4444',
          info:    '#60A5FA',
        },
        dark: {
          background: '#0B1020',
          surface:    '#0F172A',
          textPrimary:   '#E5E7EB',
          textSecondary: '#94A3B8',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #2563EB 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        md: '0 8px 24px rgba(0,0,0,0.08)',
        lg: '0 12px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}