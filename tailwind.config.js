/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-soft': 'var(--surface-soft)',
        primary: 'var(--text)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        green: 'var(--green)',
        'green-dark': 'var(--green-dark)',
        'green-soft': 'var(--green-soft)',
        'green-border': 'var(--green-border)',
        line: 'var(--line)',
        error: 'var(--error)',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', '"STSong"', 'Georgia', 'serif'],
        sans: ['"Geist"', '"Noto Sans SC"', '"PingFang SC"', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
        body: ['"Geist"', '"Noto Sans SC"', '"PingFang SC"', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
        label: ['"Geist"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', '"Menlo"', '"Consolas"', 'monospace'],
      },
      borderRadius: {
        card: '20px',
        'card-lg': '24px',
        'card-xl': '28px',
        pill: '9999px',
        input: '12px',
      },
      boxShadow: {
        'card': '0 4px 16px rgba(37,58,43,0.05)',
        'card-hover': '0 18px 50px rgba(37,58,43,0.08)',
        'card-raised': '0 24px 60px rgba(37,58,43,0.12)',
      },
      maxWidth: {
        content: '1120px',
        read: '720px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
