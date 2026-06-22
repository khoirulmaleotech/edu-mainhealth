/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ── PALET WARNA UTAMA GRAND DESIGN TELKOM CSR ──
        telkom: {
          red: "#EE2E24",       // Warna Merah Utama Telkom
          dark: "#0F172A",      // Dark Slate untuk text/sidebar premium
          gray: "#F8FAFC",      // Light Gray untuk background panel
          accent: "#00ADB5"     // Tetap mempertahankan cyan sebagai aksen sekunder cerdas
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#00ADB5",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        
        // --- NEW HOMEPAGE COLORS ---
        "surface": "#FFFFFF",
        "surface-dim": "#F8FAFC",
        "primary-fixed-dim": "#137e7e",
        "primary": "#00ADB5",
        "slate-text": "#64748B",
        "orange-accent": "#EE2E24", // Telkom Red
        "inverse-primary": "#006a6a",
        "secondary": "#ffb4a2",
        "on-primary": "#FFFFFF",
        "surface-container-high": "#F1F5F9",
        "on-secondary-container": "#8a1c00",
        "primary-container": "#E6F2F2",
        "inverse-surface": "#0F172A",
        "on-secondary-fixed": "#3c0700",
        "error-container": "#FEE2E2",
        "surface-variant": "#E2E8F0",
        "tertiary-fixed-dim": "#f7be1d",
        "on-surface-variant": "#475569",
        "gold-indicator": "#EAB308",
        "on-surface": "#0F172A", // Dark Slate
        "on-secondary": "#FFFFFF",
        "surface-tint": "#00ADB5",
        "teal-action": "#00ADB5", // Cyan Action
        "on-secondary-fixed-variant": "#8a1c00",
        "surface-container": "#F8FAFC",
        "error": "#EF4444",
        "on-error": "#FFFFFF",
        "surface-container-lowest": "#FFFFFF",
        "inverse-on-surface": "#F8FAFC",
        "navy-deep": "#0F172A",
        "on-error-container": "#991B1B",
        "on-background": "#0F172A",
        "on-primary-fixed-variant": "#004f50",
        "secondary-container": "#ffdad2",
        "on-tertiary": "#3f2e00",
        "surface-container-highest": "#CBD5E1",
        "primary-fixed": "#d6fffe",
        "outline-variant": "#E2E8F0",
        "tertiary-container": "#fff6ea",
        "surface-bright": "#FFFFFF",
        "on-tertiary-fixed-variant": "#5a4300",
        "surface-container-low": "#F8FAFC",
        "secondary-fixed": "#ffdad2",
        "tertiary-fixed": "#ffdf9a",
        "on-primary-container": "#003737",
        "tertiary": "#f7be1d",
        "on-primary-fixed": "#002020",
        "on-tertiary-fixed": "#251a00",
        "secondary-fixed-dim": "#ffb4a2",
        "on-tertiary-container": "#3f2e00",
        "surface-teal-light": "#E6F2F2"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'pulse-slow': 'pulse-slow 8s infinite ease-in-out',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.1', transform: 'scale(1)' },
          '50%': { opacity: '0.2', transform: 'scale(1.1)' },
        }
      },
      spacing: {
        "stack-sm": "8px",
        "margin-mobile": "16px",
        "stack-md": "16px",
        "gutter": "24px",
        "section-gap": "80px",
        "container-max": "1280px",
        "stack-lg": "32px"
      },
      fontFamily: {
        "display-lg": ["sans-serif"],
        "body-md": ["sans-serif"],
        "headline-lg": ["sans-serif"],
        "body-lg": ["sans-serif"],
        "metric-num": ["sans-serif"],
        "headline-lg-mobile": ["sans-serif"],
        "headline-md": ["sans-serif"],
        "label-caps": ["sans-serif"]
      },
      fontSize: {
        "display-lg": ["84px", {"lineHeight": "1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "600"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "metric-num": ["40px", {"lineHeight": "48px", "fontWeight": "600"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "label-caps": ["14px", {"lineHeight": "20px", "letterSpacing": "0.1em", "fontWeight": "700"}]
      }
    },
  },
  plugins: [],
}