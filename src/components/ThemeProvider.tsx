import { createContext, useContext, useMemo } from 'react'
import type { Theme } from '../types'
import { getDynamicGradient } from '../utils/time'
import { useTime } from '../hooks/useTime'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  bgStyle: React.CSSProperties
  textPrimary: string
  textSecondary: string
  textMuted: string
  surface: string
  surfaceHover: string
  border: string
  accent: string
  accentHover: string
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue>(null!)

export function useTheme() {
  return useContext(ThemeContext)
}

const THEMES: Record<Theme, Omit<ThemeContextValue, 'theme' | 'setTheme' | 'bgStyle'>> = {
  oled: {
    textPrimary: 'text-white',
    textSecondary: 'text-zinc-400',
    textMuted: 'text-zinc-600',
    surface: 'bg-[#0a0a0a]',
    surfaceHover: 'hover:bg-[#141414]',
    border: 'border-[#1a1a1a]',
    accent: 'bg-indigo-600',
    accentHover: 'hover:bg-indigo-500',
    isDark: true,
  },
  light: {
    textPrimary: 'text-zinc-900',
    textSecondary: 'text-zinc-600',
    textMuted: 'text-zinc-400',
    surface: 'bg-white',
    surfaceHover: 'hover:bg-zinc-50',
    border: 'border-zinc-200',
    accent: 'bg-indigo-600',
    accentHover: 'hover:bg-indigo-500',
    isDark: false,
  },
  dynamic: {
    textPrimary: 'text-white',
    textSecondary: 'text-white/70',
    textMuted: 'text-white/40',
    surface: 'bg-white/10',
    surfaceHover: 'hover:bg-white/15',
    border: 'border-white/10',
    accent: 'bg-indigo-500',
    accentHover: 'hover:bg-indigo-400',
    isDark: true,
  },
}

interface Props {
  theme: Theme
  setTheme: (theme: Theme) => void
  children: React.ReactNode
}

export function ThemeProvider({ theme, setTheme, children }: Props) {
  const now = useTime()

  const bgStyle = useMemo<React.CSSProperties>(() => {
    switch (theme) {
      case 'oled':
        return { background: '#000000' }
      case 'light':
        return { background: '#f8fafc' }
      case 'dynamic':
        return { background: getDynamicGradient(now), transition: 'background 2s ease' }
    }
  }, [theme, theme === 'dynamic' ? Math.floor(now.getMinutes() / 5) : 0])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      bgStyle,
      ...THEMES[theme],
    }),
    [theme, setTheme, bgStyle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
