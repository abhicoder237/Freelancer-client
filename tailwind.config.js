/** @type {import('tailwindcss').Config} */
export default {
  // ── Files to scan for class names ────────
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  // ── Dark mode via class ──────────────────
  darkMode: "class",

  theme: {
    extend: {

      // ── Dynamic Colors via CSS Variables ──
      // These map to --color-* variables
      // injected by ThemeProvider from DB
      colors: {
        primary:        "var(--color-primary)",
        secondary:      "var(--color-secondary)",
        accent:         "var(--color-accent)",
        background:     "var(--color-background)",
        surface:        "var(--color-surface)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary":"var(--color-text-secondary)",
        border:         "var(--color-border)",
        success:        "var(--color-success)",
        error:          "var(--color-error)",
        navbar:         "var(--color-navbar)",
        footer:         "var(--color-footer)",
      },

      // ── Dynamic Fonts via CSS Variables ───
      fontFamily: {
        heading: "var(--font-heading)",
        body:    "var(--font-body)",
      },

      // ── Dynamic Font Size ─────────────────
      fontSize: {
        base: "var(--font-size-base)",
      },

      // ── Dynamic Line Height ───────────────
      lineHeight: {
        theme: "var(--line-height)",
      },

      // ── Dynamic Letter Spacing ────────────
      letterSpacing: {
        theme: "var(--letter-spacing)",
      },

      // ── Border Radius Presets ─────────────
      borderRadius: {
        sm:   "4px",
        md:   "8px",
        lg:   "12px",
        xl:   "16px",
        "2xl":"24px",
        full: "9999px",
      },

      // ── Container Sizes ───────────────────
      maxWidth: {
        container: "var(--container-max-width, 1280px)",
      },

      // ── Animations ────────────────────────
      animation: {
        "fade-in":     "fadeIn 0.3s ease-in-out",
        "fade-up":     "fadeUp 0.4s ease-out",
        "slide-in":    "slideIn 0.3s ease-out",
        "slide-up":    "slideUp 0.4s ease-out",
        "zoom-in":     "zoomIn 0.3s ease-out",
        "bounce-in":   "bounceIn 0.5s ease-out",
        "spin-slow":   "spin 3s linear infinite",
        "pulse-slow":  "pulse 3s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)",     opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        zoomIn: {
          "0%":   { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)",    opacity: "1" },
        },
        bounceIn: {
          "0%":   { transform: "scale(0.3)",  opacity: "0" },
          "50%":  { transform: "scale(1.05)" },
          "70%":  { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)",    opacity: "1" },
        },
      },

      // ── Box Shadows ───────────────────────
      boxShadow: {
        card:    "0 2px 8px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.12)",
        navbar:  "0 2px 12px rgba(0,0,0,0.08)",
        modal:   "0 20px 60px rgba(0,0,0,0.15)",
        button:  "0 4px 12px rgba(0,0,0,0.15)",
      },

      // ── Transitions ───────────────────────
      transitionDuration: {
        250: "250ms",
        350: "350ms",
        400: "400ms",
      },

      // ── Z-Index Scale ─────────────────────
      zIndex: {
        navbar:  "100",
        modal:   "200",
        toast:   "300",
        tooltip: "400",
      },

      // ── Spacing Extras ────────────────────
      spacing: {
        "18":  "4.5rem",
        "88":  "22rem",
        "128": "32rem",
      },
    },
  },

  plugins: [],
};