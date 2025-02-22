/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
      },
      boxShadow: {
        glow: "0 0 2rem 0 rgba(59, 130, 246, 0.2)",
      },
      animation: {
        'skew-scroll': 'skew-scroll 20s linear infinite',
        'marquee': 'marquee var(--duration) linear infinite',
        'marquee-reverse': 'marquee-reverse var(--duration) linear infinite',
        'expand-from-center': 'expand-from-center var(--duration) linear infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        'skew-scroll': {
          '0%': {
            transform: 'rotateX(20deg) rotateZ(-20deg) skewX(20deg)',
          },
          '100%': {
            transform: 'rotateX(20deg) rotateZ(-20deg) skewX(20deg) translateY(-100%)',
          },
        },
        'marquee': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(calc(-100% - var(--gap)))' }
        },
        'marquee-reverse': {
          'from': { transform: 'translateX(calc(-100% - var(--gap)))' },
          'to': { transform: 'translateX(0)' }
        },
        'expand-from-center': {
          '0%': { transform: 'translateX(50%) scale(0.5)', opacity: '0' },
          '15%': { transform: 'translateX(0) scale(1)', opacity: '1' },
          '85%': { transform: 'translateX(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateX(-50%) scale(0.5)', opacity: '0' }
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
      maxWidth: {
        'container': '1280px',
      },
    },
  },
  plugins: [
    addVariablesForColors,
  ],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

function flattenColorPalette(colors) {
  const flatColors = {};
  
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      flatColors[key] = value;
    } else {
      for (const [shade, color] of Object.entries(value)) {
        flatColors[`${key}-${shade}`] = color;
      }
    }
  }
  
  return flatColors;
}