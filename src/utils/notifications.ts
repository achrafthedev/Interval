export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function sendNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'interval-alert',
    requireInteraction: true,
    silent: false,
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  return notification
}
