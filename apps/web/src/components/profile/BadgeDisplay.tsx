'use client'

import { Award, Star, TrendingUp, Users, BookOpen, Heart } from 'lucide-react'

interface Badge {
  id: string
  type: string
  title: string
  description: string
  earnedAt: Date
  icon: string
  color: string
}

interface BadgeDisplayProps {
  badges: Badge[]
}

const badgeIcons: Record<string, any> = {
  verified: Award,
  top_contributor: Star,
  rising_star: TrendingUp,
  community_leader: Users,
  educator: BookOpen,
  compassionate_care: Heart
}

const badgeColors: Record<string, string> = {
  verified: 'bg-blue-100 text-blue-700 border-blue-300',
  top_contributor: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  rising_star: 'bg-purple-100 text-purple-700 border-purple-300',
  community_leader: 'bg-green-100 text-green-700 border-green-300',
  educator: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  compassionate_care: 'bg-pink-100 text-pink-700 border-pink-300'
}

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No badges earned yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Earn badges by contributing quality content and helping patients
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge) => {
        const Icon = badgeIcons[badge.type] || Award
        const colorClass = badgeColors[badge.type] || 'bg-gray-100 text-gray-700 border-gray-300'

        return (
          <div
            key={badge.id}
            className={`p-4 rounded-lg border-2 ${colorClass} hover:shadow-lg transition`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{badge.title}</h4>
                <p className="text-sm opacity-90 mb-2">{badge.description}</p>
                <p className="text-xs opacity-75">
                  Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Helper function to generate sample badges based on doctor activity
export function generateBadgesFromActivity(doctorData: any): Badge[] {
  const badges: Badge[] = []

  // Verified Doctor Badge
  if (doctorData.doctorVerificationStatus === 'APPROVED') {
    badges.push({
      id: 'verified',
      type: 'verified',
      title: 'Verified Doctor',
      description: 'Medical credentials verified by MedThread',
      earnedAt: doctorData.verifiedAt || new Date(),
      icon: 'award',
      color: 'blue'
    })
  }

  // Top Contributor Badge (based on reply count)
  if (doctorData.replyCount && doctorData.replyCount > 50) {
    badges.push({
      id: 'top_contributor',
      type: 'top_contributor',
      title: 'Top Contributor',
      description: 'Provided over 50 helpful medical responses',
      earnedAt: new Date(),
      icon: 'star',
      color: 'yellow'
    })
  }

  // Rising Star Badge (based on recent activity)
  if (doctorData.recentActivityScore && doctorData.recentActivityScore > 100) {
    badges.push({
      id: 'rising_star',
      type: 'rising_star',
      title: 'Rising Star',
      description: 'Rapidly growing reputation in the community',
      earnedAt: new Date(),
      icon: 'trending-up',
      color: 'purple'
    })
  }

  // Community Leader Badge
  if (doctorData.followerCount && doctorData.followerCount > 100) {
    badges.push({
      id: 'community_leader',
      type: 'community_leader',
      title: 'Community Leader',
      description: 'Trusted by over 100 community members',
      earnedAt: new Date(),
      icon: 'users',
      color: 'green'
    })
  }

  // Educator Badge (based on educational content)
  if (doctorData.educationalPostCount && doctorData.educationalPostCount > 20) {
    badges.push({
      id: 'educator',
      type: 'educator',
      title: 'Medical Educator',
      description: 'Shared valuable educational medical content',
      earnedAt: new Date(),
      icon: 'book-open',
      color: 'indigo'
    })
  }

  // Compassionate Care Badge (based on patient feedback)
  if (doctorData.averageRating && doctorData.averageRating >= 4.8) {
    badges.push({
      id: 'compassionate_care',
      type: 'compassionate_care',
      title: 'Compassionate Care',
      description: 'Consistently receives excellent patient feedback',
      earnedAt: new Date(),
      icon: 'heart',
      color: 'pink'
    })
  }

  return badges
}
