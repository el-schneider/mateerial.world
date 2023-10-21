/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				display: ['Impact', "Arial", 'sans-serif']
			}
		}
	},

	plugins: []
};

module.exports = config;
