/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: "#556B2F",  // Dark Olive Green (Background)
        beige: "#F5F5DC",  // Light Beige (Text)#8A9A5B
        gold: "#DAA520",   // Golden Accent
        darkText: "#333333", // Dark Text
        sageGreen : "#9AA899", //soft background color
        mintGreen : "#E8F5E9" ,
        cardGreen : "#A5D6A7",
        darkGreen : "#1B5E20",

        // browns Shades 
        lightTan : "#F5F5DC",
        sandBrown : "#EBD9B4",
        richBrown : "#8B5E3C",
        darkWalnut : "#4E342E",
        
      },
    },
  },
  plugins: [],
}

