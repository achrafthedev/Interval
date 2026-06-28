import { useState } from 'react'
import { useAnimationFrame } from './useAnimationFrame'

export function useTime() {
  const [now, setNow] = useState(() => new Date())

  useAnimationFrame(() => {
    setNow(new Date())
  })

  return now
}
