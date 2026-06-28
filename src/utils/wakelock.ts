let wakeLock: WakeLockSentinel | null = null

export function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator
}

export async function requestWakeLock(): Promise<boolean> {
  if (!isWakeLockSupported()) return false

  try {
    wakeLock = await navigator.wakeLock.request('screen')
    wakeLock.addEventListener('release', () => { wakeLock = null })
    return true
  } catch {
    return false
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    await wakeLock.release()
    wakeLock = null
  }
}

export function isWakeLockActive(): boolean {
  return wakeLock !== null && !wakeLock.released
}

// Re-acquire wake lock when tab becomes visible again
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wakeLock !== null) {
      requestWakeLock()
    }
  })
}
