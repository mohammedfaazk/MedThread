'use client'

interface Award {
  award: {
    id: string
    name: string
    icon: string
    color: string
  }
  count: number
  givers?: Array<{
    username: string
    avatar?: string
  }>
}

interface AwardDisplayProps {
  awards: Award[]
  size?: 'small' | 'medium' | 'large'
}

export function AwardDisplay({ awards, size = 'medium' }: AwardDisplayProps) {
  if (!awards || awards.length === 0) {
    return null
  }

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  const iconSizes = {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-2xl'
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {awards.map((awardItem, index) => (
        <div
          key={index}
          className="flex items-center gap-1 px-2 py-1 rounded-full border"
          style={{
            backgroundColor: `${awardItem.award.color}15`,
            borderColor: `${awardItem.award.color}40`
          }}
          title={`${awardItem.award.name} x${awardItem.count}${
            awardItem.givers ? ` from ${awardItem.givers.map(g => g.username).join(', ')}` : ''
          }`}
        >
          <span className={iconSizes[size]}>{awardItem.award.icon}</span>
          {awardItem.count > 1 && (
            <span className={`font-bold ${sizeClasses[size]}`} style={{ color: awardItem.award.color }}>
              {awardItem.count}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
