const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const daisyUI = require("daisyui")

module.exports = {
  darkMode: 'selector',
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  daisyui: {
    themes: ["light", "night", "acid"],
  },
  theme: {
    extend: {},
  },
  plugins: [daisyUI],
};