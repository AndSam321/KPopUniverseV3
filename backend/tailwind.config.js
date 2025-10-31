module.exports = {
  content: [
    "./app/views/**/*.html.erb",
    "./app/helpers/**/*.rb",
    "./app/assets/stylesheets/**/*.css",
    "./app/javascript/**/*.js",
    "./app/components/**/*.{rb,erb,html}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        "kpop-primary": "#7B68EE",
        "kpop-secondary": "#FF69B4",
        "kpop-dark": "#1a1a1a",
        "kpop-light": "#f8f9fa",
      },

      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
      },
      fontSize: {
        xxs: "0.625rem",
      },
      maxWidth: {
        mobile: "640px",
        tablet: "768px",
        desktop: "1280px",
      },
      aspectRatio: {
        post: "16 / 9",
        profile: "1 / 1",
      },
      animation: {
        heart: "heart 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-in",
      },
      keyframes: {
        heart: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
