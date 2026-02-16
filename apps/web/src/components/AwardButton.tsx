'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Award, Coins, X } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface AwardType {
  id: string
  name: string
  description: string
  icon: string
  cost: number
  tier: number
  color: string
}

interface AwardButtonProps {
  postId?: string
  commentId?: string
  currentAwards?: any[]
  onAwardGiven?: () => void
}

export function AwardButton({ postId, commentId, currentAwards = [], onAwardGiven }: AwardButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [awards, setAwards] = useState<AwardType[]>([])
  const [userCoins, setUserCoins] = useState(0)
  const [loading, setLoading] = useState(false)
  const [giving, setGiving] = useState(false)

  useEffect(() => {
    if (showModal) {
      fetchAwards()
      fetchUserCoins()
    }
  }, [showModal])

  const fetchAwards = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/awards`)
      if (response.data.success) {
        setAwards(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch awards:', error)
    }
  }

  const fetchUserCoins = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get(`${API_URL}/api/v1/awards/coins/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setUserCoins(response.data.data.coins)
      }
    } catch (error) {
      console.error('Failed to fetch coins:', error)
    }
  }

  const handleGiveAward = async (awardId: string, cost: number) => {
    if (userCoins < cost) {
      alert('Insufficient coins!')
      return
    }

    setGiving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login to give awards')
        return
      }

      await axios.post(
        `${API_URL}/api/v1/awards/give`,
        {
          awardId,
          postId,
          commentId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      alert('Award given successfully!')
      setUserCoins(prev => prev - cost)
      setShowModal(false)
      if (onAwardGiven) onAwardGiven()
    } catch (error: any) {
      console.error('Failed to give award:', error)
      alert(error.response?.data?.error || 'Failed to give award')
    } finally {
      setGiving(false)
    }
  }

  const totalAwards = currentAwards.reduce((sum, a) => sum + (a.count || 1), 0)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 transition text-sm"
        title="Give Award"
      >
        <Award className="w-4 h-4 text-amber-500" />
        {totalAwards > 0 && <span className="text-gray-600 font-semibold">{totalAwards}</span>}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Give an Award</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-600">
                    Your balance: <span className="font-bold text-amber-600">{userCoins} coins</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Awards Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {awards.map((award) => {
                  const canAfford = userCoins >= award.cost
                  
                  return (
                    <button
                      key={award.id}
                      onClick={() => handleGiveAward(award.id, award.cost)}
                      disabled={!canAfford || giving}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        canAfford
                          ? 'border-gray-200 hover:border-amber-400 hover:shadow-lg cursor-pointer'
                          : 'border-gray-100 opacity-50 cursor-not-allowed'
                      }`}
                      style={{
                        backgroundColor: canAfford ? `${award.color}10` : '#f9fafb'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{award.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{award.name}</h3>
                          <p className="text-xs text-gray-600 mb-2">{award.description}</p>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-bold" style={{ color: award.color }}>
                              {award.cost} coins
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {awards.length === 0 && (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No awards available</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 text-center">
                Awards help recognize valuable contributions to the community
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
