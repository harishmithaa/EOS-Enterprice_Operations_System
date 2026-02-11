/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0f766e', // Teal 700
                secondary: '#f59e0b', // Amber 500
                danger: '#ef4444', // Red 500
            }
        },
    },
    plugins: [],
}
