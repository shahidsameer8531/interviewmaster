import type { Config } from "tailwindcss";

const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

const config: Config = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    future: {
        hoverOnlyWhenSupported: true,
    },
    theme: {
        extend: {
            fontFamily: {
                display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
                sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                chart: {
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
                },
                navy: {
                    950: "#060d1f",
                    900: "#0a1628",
                    800: "#0f1f3a",
                    700: "#16294d",
                    600: "#1f3458",
                    500: "#2b4a7a",
                    400: "#3d6ab0",
                    300: "#6f93cf",
                },
                gold: {
                    DEFAULT: "#fcba28",
                    soft: "#fcd978",
                    deep: "#e0a829",
                },
                ink: {
                    DEFAULT: "#eef2fa",
                    muted: "#8fa3c7",
                },
                brand: {
                    red: "#ff652f",
                    yellow: "#fcba28",
                    green: "#2dd4a4",
                    blue: "#3d6ab0",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                "2xl": "1.25rem",
                "3xl": "1.75rem",
            },
            boxShadow: {
                glow: "0 0 0 1px rgba(252,186,40,0.25), 0 12px 40px -12px rgba(252,186,40,0.45)",
                panel: "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 50px -30px rgba(0,0,0,0.8)",
            },
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-8px)" },
                },
                marquee: {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
                "pulse-ring": {
                    "0%": { transform: "scale(0.9)", opacity: "0.8" },
                    "100%": { transform: "scale(2.2)", opacity: "0" },
                },
            },
            animation: {
                shimmer: "shimmer 2.5s linear infinite",
                float: "float 6s ease-in-out infinite",
                marquee: "marquee 40s linear infinite",
                "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.2, 0.7, 0.4, 1) infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate"), addVariablesForColors],
};

// Exposes every static theme colour as a CSS variable (e.g. --navy-800) so
// hand-written CSS and inline styles can share the palette. Colours that are
// already defined through variables are skipped to avoid self-references.
function addVariablesForColors({ addBase, theme }: any) {
    const allColors = flattenColorPalette(theme("colors"));
    const newVars = Object.fromEntries(
        Object.entries(allColors)
            .filter(([, val]) => typeof val === "string" && !val.includes("var("))
            .map(([key, val]) => [`--${key}`, val])
    );
    addBase({ ":root": newVars });
}

export default config;
