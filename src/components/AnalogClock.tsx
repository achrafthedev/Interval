import { useTheme } from './ThemeProvider'

interface Props {
  date: Date
  size?: number
}

export function AnalogClock({ date, size = 280 }: Props) {
  const { isDark } = useTheme()
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 8

  const hours = date.getHours() % 12
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const ms = date.getMilliseconds()

  const secondAngle = ((seconds + ms / 1000) / 60) * 360 - 90
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360 - 90
  const hourAngle = ((hours + minutes / 60) / 12) * 360 - 90

  const hourLength = r * 0.5
  const minuteLength = r * 0.7
  const secondLength = r * 0.85

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const handEnd = (angle: number, length: number) => ({
    x: cx + length * Math.cos(toRad(angle)),
    y: cy + length * Math.sin(toRad(angle)),
  })

  const hourEnd = handEnd(hourAngle, hourLength)
  const minuteEnd = handEnd(minuteAngle, minuteLength)
  const secondEnd = handEnd(secondAngle, secondLength)

  const faceColor = isDark ? '#ffffff' : '#18181b'
  const markColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
  const hourMarkColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} strokeWidth="2" />

      {/* Minute marks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = (i / 60) * 360 - 90
        const isHour = i % 5 === 0
        const innerR = isHour ? r - 16 : r - 8
        const start = {
          x: cx + innerR * Math.cos(toRad(angle)),
          y: cy + innerR * Math.sin(toRad(angle)),
        }
        const end = {
          x: cx + (r - 3) * Math.cos(toRad(angle)),
          y: cy + (r - 3) * Math.sin(toRad(angle)),
        }
        return (
          <line
            key={i}
            x1={start.x} y1={start.y}
            x2={end.x} y2={end.y}
            stroke={isHour ? hourMarkColor : markColor}
            strokeWidth={isHour ? 2.5 : 1}
            strokeLinecap="round"
          />
        )
      })}

      {/* Hour numbers */}
      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
        const angle = (i / 12) * 360 - 90
        const pos = {
          x: cx + (r - 32) * Math.cos(toRad(angle)),
          y: cy + (r - 32) * Math.sin(toRad(angle)),
        }
        return (
          <text
            key={num}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
            fontSize={size > 200 ? 14 : 10}
            fontFamily="Inter, sans-serif"
            fontWeight="500"
          >
            {num}
          </text>
        )
      })}

      {/* Hour hand */}
      <line
        x1={cx} y1={cy}
        x2={hourEnd.x} y2={hourEnd.y}
        stroke={faceColor}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.9}
      />

      {/* Minute hand */}
      <line
        x1={cx} y1={cy}
        x2={minuteEnd.x} y2={minuteEnd.y}
        stroke={faceColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Second hand */}
      <line
        x1={cx} y1={cy}
        x2={secondEnd.x} y2={secondEnd.y}
        stroke="#6366f1"
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} fill="#6366f1" />
      <circle cx={cx} cy={cy} r={2} fill={isDark ? '#000' : '#fff'} />
    </svg>
  )
}
