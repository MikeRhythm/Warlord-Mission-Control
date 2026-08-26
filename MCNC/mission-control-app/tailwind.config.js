/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rhythm: {
          'obsidian-deep': '#070913',
          'charcoal-matte': '#0f172a',
          'glass-specular': '#131b2e',
          'goldenrod-core': '#DAA520',  // TRUE Goldenrod - Structural lines only
          'gold-liquid': '#B8860B',     // Darker goldenrod for hover/active states
          'silver-mist': '#f8fafc',     // Silver/white-smoke text
          'sage-metallic': '#94a3b8',   // Muted text
          'slate-reflection': '#1e293b', // Subtle border
          'maroon-depth': '#334155',    // Active state border
        },
        status: {
          'green': '#22c55e',   // Online/Active
          'red': '#ef4444',     // Error/Danger
          'blue': '#3b82f6',    // Info/Neutral
          'amber': '#fbbf24',   // Warning
        }
      },
      borderWidth: {
        'structural': '3px',   // For primary structural lines
        'thin': '1px',         // For subtle borders
        'thick': '4px',        // For prominent dividers
      },
      fontFamily: {
        }
    },
  },
  plugins: [],
}