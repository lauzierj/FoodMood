import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        gray: {
          50: { value: '#f7fafc' },
          100: { value: '#edf2f7' },
          200: { value: '#e2e8f0' },
          300: { value: '#cbd5e0' },
          400: { value: '#a0aec0' },
          500: { value: '#718096' },
          600: { value: '#4a5568' },
          700: { value: '#2d3748' },
          800: { value: '#1a202c' },
          900: { value: '#171923' },
        },
      },
    },
  },
  globalCss: {
    html: {
      height: '100%',
    },
    body: {
      bg: 'gray.900',
      color: 'gray.100',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      WebkitOverflowScrolling: 'touch',
      touchAction: 'pan-y',
      overscrollBehaviorY: 'contain', // Prevent overscroll bounce for pull-to-refresh
    },
    '#root': {
      minHeight: '100vh',
    },
    '*': {
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
    },
    'input, textarea': {
      userSelect: 'text',
      WebkitUserSelect: 'text',
      MozUserSelect: 'text',
      msUserSelect: 'text',
    },
    // Ensure Recharts axis tick text is visible in dark mode
    '.recharts-yAxis .recharts-cartesian-axis-tick text': {
      fill: '#edf2f7 !important',
    },
    '.recharts-xAxis .recharts-cartesian-axis-tick text': {
      fill: '#edf2f7 !important',
    },
  },
});

const theme = createSystem(defaultConfig, customConfig);

export default theme;