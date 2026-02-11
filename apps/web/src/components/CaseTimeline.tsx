'use client'

import { Stethoscope, UserRound, ClipboardList, Pill, CheckCircle, Pin } from 'lucide-react'

interface TimelineEvent {
  id: string
  eventType: string
  timestamp: Date
  data: any
  user: { username: string; role: string }
}

interface CaseTimelineProps {
  events: TimelineEvent[]
}

export function CaseTimeline({ events }: CaseTimelineProps) {
  const getEventIcon = (eventType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      SYMPTOM_START: <Stethoscope className="w-4 h-4 text-charcoal" />,
      DOCTOR_ADVICE: <UserRound className="w-4 h-4 text-charcoal" />,
      TEST_RESULTS: <ClipboardList className="w-4 h-4 text-charcoal" />,
      MEDICATION_UPDATE: <Pill className="w-4 h-4 text-charcoal" />,
      RECOVERY_LOG: <CheckCircle className="w-4 h-4 text-charcoal" />
    }
    return iconMap[eventType] || <Pin className="w-4 h-4 text-charcoal" />
  }

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
      <h3 className="text-xl font-bold mb-6 text-charcoal">Case Timeline</h3>
      
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200/50" />
        
        <div className="space-y-6">
          {events.map((event, idx) => (
            <div key={event.id} className="relative pl-12">
              <div className="absolute left-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg">
                {getEventIcon(event.eventType)}
              </div>
              
              <div>
                <p className="font-semibold text-charcoal">
                  {event.eventType.replace(/_/g, ' ')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  by {event.user.username}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
