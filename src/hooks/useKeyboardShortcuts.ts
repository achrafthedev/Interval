import { useEffect } from 'react'
import type { View } from '../types'

interface Shortcuts {
  setView: (view: View) => void
  onFullscreen: () => void
  onThemeCycle: () => void
}

export function useKeyboardShortcuts({ setView, onFullscreen, onThemeCycle }: Shortcuts) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Don't trigger when typing in an input
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.altKey || e.ctrlKey || e.metaKey) return

      switch (e.key) {
        case '1': setView('clock'); break
        case '2': setView('alarm'); break
        case '3': setView('timer'); break
        case '4': setView('stopwatch'); break
        case 'f': onFullscreen(); break
        case 't': onThemeCycle(); break
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [setView, onFullscreen, onThemeCycle])
}
