/** @type {import('tailwindcss').Config} */
const c = (v) => `rgb(var(--${v}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: c('paper'), raised: c('raised'), ink: c('ink'), ink2: c('ink2'), rule: c('rule'),
        gym: c('gym'), run: c('run'), mobility: c('mobility'), onpillar: c('onpillar'),
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter Tight Variable"', '"Inter Tight"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['3.25rem', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        title: ['2.25rem', { lineHeight: '1', letterSpacing: '-0.015em' }],
        huge: ['6.5rem', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
      },
      transitionTimingFunction: { out: 'cubic-bezier(0.2, 0.8, 0.2, 1)', spring: 'cubic-bezier(0.34, 1.4, 0.64, 1)' },
    },
  },
  plugins: [],
};
