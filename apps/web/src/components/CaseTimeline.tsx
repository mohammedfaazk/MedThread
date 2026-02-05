'use client'

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
  const eventIcons: Record<string, string> = {
    SYMPTOM_START: '🩺',
    DOCTOR_ADVICE: '👨‍⚕️',
    TEST_RESULTS: '📋',
    MEDICATION_UPDATE: '💊',
    RECOVERY_LOG: '✅'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-bold mb-6">Case Timeline</h3>
      
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="space-y-6">
          {events.map((event, idx) => (
            <div key={event.id} className="relative pl-12">
              <div className="absolute left-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span>{eventIcons[event.eventType] || '📌'}</span>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900">
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
