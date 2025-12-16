// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Definindo as keyframes para as animações
      keyframes: {
        // Animação de fade-in
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' }, // Começa invisível e ligeiramente abaixo
          '100%': { opacity: '1', transform: 'translateY(0)' },  // Termina visível e na posição original
        },
        // Animação de slide-up (já existente, mas mantida)
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Associando as keyframes a classes de animação
      animation: {
        // 'fade-in' é a nova animação que aplicamos ao conteúdo principal
        'fade-in': 'fadeIn 0.5s ease-out forwards', // 0.5s de duração, ease-out, mantém o estado final
        // Mantendo as animações existentes, se você as usa em outro lugar
        fadeIn: 'fadeIn 0.3s ease-in-out', // Nota: Pode haver um conflito de nomes se você usar as duas.
                                            // Sugiro usar apenas 'fade-in' ou renomear esta.
        slideUp: 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};