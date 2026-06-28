let pipCanvas: HTMLCanvasElement | null = null
let pipVideo: HTMLVideoElement | null = null
let pipAnimationId: number | null = null

export function isPiPSupported(): boolean {
  return 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled
}

export async function startPiP(getText: () => string): Promise<void> {
  if (!isPiPSupported()) return

  pipCanvas = document.createElement('canvas')
  pipCanvas.width = 400
  pipCanvas.height = 160
  const ctx = pipCanvas.getContext('2d')!

  pipVideo = document.createElement('video')
  pipVideo.muted = true
  const stream = pipCanvas.captureStream(30)
  pipVideo.srcObject = stream
  await pipVideo.play()

  function draw() {
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 400, 160)

    ctx.fillStyle = '#6366f1'
    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('INTERVAL', 16, 28)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Orbitron, monospace'
    ctx.textAlign = 'center'
    ctx.fillText(getText(), 200, 105)

    pipAnimationId = requestAnimationFrame(draw)
  }

  draw()

  try {
    await pipVideo.requestPictureInPicture()
  } catch { /* user denied */ }

  pipVideo.addEventListener('leavepictureinpicture', stopPiP)
}

export function stopPiP() {
  if (pipAnimationId) {
    cancelAnimationFrame(pipAnimationId)
    pipAnimationId = null
  }
  if (pipVideo) {
    const stream = pipVideo.srcObject as MediaStream | null
    stream?.getTracks().forEach((t) => t.stop())
    pipVideo.srcObject = null
    pipVideo = null
  }
  pipCanvas = null

  if (document.pictureInPictureElement) {
    document.exitPictureInPicture().catch(() => {})
  }
}

export function isPiPActive(): boolean {
  return !!document.pictureInPictureElement
}
