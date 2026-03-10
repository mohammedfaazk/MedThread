'use client'

import CountUp from './CountUp'

interface CountUpNumberProps {
  value: number
  start?: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  separator?: string
}

export function CountUpNumber({ 
  value, 
  start = 0, 
  duration = 2000, 
  suffix = '', 
  prefix = '',
  className = '',
  separator = ','
}: CountUpNumberProps) {
  return (
    <span className={className}>
      {prefix}
      <CountUp
        from={start}
        to={value}
        duration={duration / 1000} // Convert ms to seconds
        separator={separator}
        className="inline"
      />
      {suffix}
    </span>
  )
}

