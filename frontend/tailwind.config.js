/** @type {import('tailwindcss').Config} */
module.exports = {
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
        // Mapping ulang primary & secondary agar sinkron dengan Grand Design baru
        primary: {
          DEFAULT: "#EE2E24",   // Menggeser warna cyan lama menjadi merah Telkom
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0F172A",
          foreground: "#F8FAFC",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}