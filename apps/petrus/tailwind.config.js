const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

module.exports = {
  darkMode: 'class',
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 Tema gostozin
        primary: {
          DEFAULT: "#fbe72b", // verde limpo
          dark: "#bcab0d",
          light: "#86EFAC",
        },
        secondary: {
          DEFAULT: "#60A5FA",
          dark: "#3B82F6",
          light: "#93C5FD",
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          800: "#1F2937",
          900: "#111827",
        },
        background: {
          light: "#FFFFFF",
          dark: "#0B0B0F",
        },
        text: {
          light: "#181818",
          dark: "#F8FAFC"
        },
        surface: {
          light: "#F8FAFC",
          dark: "#18181B",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        smooth: "0 4px 20px rgba(0,0,0,0.2)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: []
};
