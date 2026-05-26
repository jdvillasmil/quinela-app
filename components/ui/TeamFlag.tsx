import { flagCode } from '@/lib/i18n/flags'

interface Props {
  team: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: { w: 20, h: 15 },
  md: { w: 24, h: 18 },
  lg: { w: 32, h: 24 },
}

export default function TeamFlag({ team, size = 'md', className }: Props) {
  const code = flagCode(team)
  if (!code) return null
  const { w, h } = SIZE_MAP[size]
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${w}x${h}/${code}.png`}
      srcSet={`https://flagcdn.com/${w * 2}x${h * 2}/${code}.png 2x`}
      alt={team}
      width={w}
      height={h}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0 }}
    />
  )
}
