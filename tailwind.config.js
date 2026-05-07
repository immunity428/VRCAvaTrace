/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        bg: '#0c0c12',
        bg2: '#13131e',
        bg3: '#1a1a28',
        border: '#2a2a40',
        border2: '#3a3a55',
        accent: '#7c6af7',
        accent2: '#a855f7',
        accent3: '#06b6d4',
        text1: '#e8e8f0',
        text2: '#9090b0',
        text3: '#5a5a78',
      },
      fontFamily: {
        sans: ['"Zen Kaku Gothic New"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
