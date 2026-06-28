import { useEffect, useRef } from 'react'

const WORKER_BLOB = new Blob([
  `let id=null;self.onmessage=e=>{if(e.data==='start'){if(id)clearInterval(id);id=setInterval(()=>self.postMessage('tick'),500)}else if(e.data==='stop'){if(id){clearInterval(id);id=null}}}`
], { type: 'application/javascript' })

let sharedWorker: Worker | null = null
let listenerCount = 0

function getWorker(): Worker {
  if (!sharedWorker) {
    sharedWorker = new Worker(URL.createObjectURL(WORKER_BLOB))
  }
  return sharedWorker
}

export function useBackgroundTimer(callback: () => void, active: boolean) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  // requestAnimationFrame for smooth foreground updates
  useEffect(() => {
    if (!active) return
    let rafId: number
    const loop = () => {
      callbackRef.current()
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [active])

  // Web Worker for reliable background ticks
  useEffect(() => {
    if (!active) return

    const worker = getWorker()
    const handler = (e: MessageEvent) => {
      if (e.data === 'tick') callbackRef.current()
    }

    worker.addEventListener('message', handler)
    listenerCount++
    if (listenerCount === 1) worker.postMessage('start')

    return () => {
      worker.removeEventListener('message', handler)
      listenerCount--
      if (listenerCount === 0) worker.postMessage('stop')
    }
  }, [active])
}
