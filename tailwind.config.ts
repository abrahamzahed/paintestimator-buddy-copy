
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
        paint: {
          light: '#F8F9FA',
          DEFAULT: '#4A6FFF',
          dark: '#3355CC'
        }
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'fade-up': {
          from: { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          to: { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'slide-in-right': {
          from: { 
            transform: 'translateX(100%)',
            opacity: '0'
          },
          to: { 
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        'scale-in': {
          from: { 
            transform: 'scale(0.9)',
            opacity: '0'
          },
          to: { 
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        'blob-animation': {
          '0%': { 
            borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%',
          },
          '50%': { 
            borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%',
          },
          '100%': { 
            borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%',
          }
        }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-up': 'fade-up 0.8s ease-out',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'scale-in': 'scale-in 0.5s ease-out',
        'blob': 'blob-animation 8s ease-in-out infinite'
			},
      fontFamily: {
        sans: ['Inter var', 'Inter', 'sans-serif'],
        display: ['SF Pro Display', 'Inter', 'sans-serif'],
      }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
