/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        background: "#F7F6E9",
        ["background-dark"]: "#deddd1",
        primary: "#B5E3C9",
        ["primary-dark"]: "#a2ccb4",
        secondary: "#C0C2E8",
        ["secondary-dark"]: "#acaed0",
        accent: "#A03B74",
        ["accent-dark"]: "#903568",
        text: "#22200C",
      },
    },
  },
  plugins: [],
  darkMode: "class",
}
