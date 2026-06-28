import { useEffect, useRef } from 'react'

export function useAnimationFrame(callback: (timestamp: number) => void, active: boolean = true) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!active) return

    let rafId: number
    const loop = (timestamp: number) => {
      callbackRef.current(timestamp)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(rafId)
  }, [active])
}
