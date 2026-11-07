/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cc: {
          bg: '#0F172A',          // Professional Slate-900 emergency agency canvas
          bgSecondary: '#1E293B', // Slate-800 header/panel surface (FEMA/GDACS institutional depth)
          surface: '#1A233A',     // Institutional clean card surface
          surfaceHover: '#232E4A',// Hover state for interactive cards
          text: '#F8FAFC',        // High contrast readable white (Slate-50)
          textMuted: '#94A3B8',   // Accessible secondary text (Slate-400)
          cyan: '#38BDF8',        // Clean informational blue (Sky-400 / UN Blue tone)
          cyanGlow: 'rgba(56, 189, 248, 0.15)',
          orange: '#F97316',      // GDACS Orange Alert level (Amber/Orange-500)
          red: '#EF4444',         // FEMA Red High Urgency (Red-500)
          green: '#10B981',       // Confirmed / Corroborated Green (Emerald-500)
          border: '#334155',      // Clear crisp border line (Slate-700)
          borderLight: '#475569', // Subtle separator (Slate-600)
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
