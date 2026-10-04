/**
 * Next.js 14.1 only discovers postcss.config.js, .cjs or .json. The previous
 * postcss.config.mjs was silently ignored, so Tailwind never ran and the
 * built CSS still contained the raw @tailwind directives.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
  },
};
