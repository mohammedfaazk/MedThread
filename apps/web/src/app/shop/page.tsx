'use client'

import { useState, useEffect } from 'react'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import axios from 'axios'
import { Coins, ShoppingCart, Award, Sparkles, Check } from 'lucide-react'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const COIN_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    coins: 100,
    price: 0.99,
    popular: false,
    icon: '🌱'
  },
  {
    id: 'basic',
    name: 'Basic Pack',
    coins: 500,
    price: 4.99,
    popular: false,
    icon: '📦'
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    coins: 1200,
    price: 9.99,
    popular: true,
    bonus: 200,
    icon: '⭐'
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    coins: 2500,
    price: 19.99,
    popular: false,
    bonus: 500,
    icon: '💎'
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    coins: 5000,
    price: 34.99,
    popular: false,
    bonus: 1500,
    icon: '👑'
  }
]

export default function ShopPage() {
  const { user } = useJWTAuth()
  const [userCoins, setUserCoins] = useState(0)
  const [awards, setAwards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserCoins()
      fetchAwards()
    }
  }, [user])

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
    } finally {
      setLoading(false)
    }
  }

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

  const handlePurchase = async (packageId: string, coins: number) => {
    // In a real app, this would integrate with a payment processor
    alert(`Payment integration coming soon! This would purchase ${coins} coins.`)
    
    // For demo purposes, you could add coins directly (admin only in production)
    // const token = localStorage.getItem('token')
    // await axios.post(`${API_URL}/api/v1/awards/coins/add`, 
    //   { amount: coins, reason: 'Purchase' },
    //   { headers: { Authorization: `Bearer ${token}` } }
    // )
  }

  return (
    <IridescenceLayout>
      <div className="min-h-screen">
      <NavbarEnhanced />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-6 px-6 pb-12">
        <Sidebar />
        
        <main className="flex-1 max-w-[900px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl p-8 mb-6 text-white shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Coins className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Coin Shop</h1>
                <p className="text-white/90 mt-1">Purchase coins to give awards and support the community</p>
              </div>
            </div>

            {/* Current Balance */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-6">
              <p className="text-white/80 text-sm mb-1">Your Balance</p>
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6" />
                <p className="text-3xl font-bold">{userCoins} coins</p>
              </div>
            </div>
          </div>

          {/* Coin Packages */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coin Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COIN_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-white/40 backdrop-blur-xl rounded-2xl border-2 p-6 shadow-soft hover:shadow-elevated transition-all relative ${
                    pkg.popular ? 'border-amber-400' : 'border-white/20'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      POPULAR
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3">{pkg.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span className="text-2xl font-bold text-amber-600">{pkg.coins}</span>
                      <span className="text-gray-600">coins</span>
                    </div>
                    {pkg.bonus && (
                      <p className="text-sm text-green-600 font-semibold">
                        +{pkg.bonus} bonus coins!
                      </p>
                    )}
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-gray-900">${pkg.price}</p>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg.id, pkg.coins + (pkg.bonus || 0))}
                    className={`w-full py-3 rounded-xl font-semibold transition ${
                      pkg.popular
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 inline mr-2" />
                    Purchase
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Awards */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Awards</h2>
            <p className="text-gray-600 mb-6">Use your coins to give these awards to posts and comments</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {awards.map((award) => (
                <div
                  key={award.id}
                  className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-soft"
                  style={{ backgroundColor: `${award.color}10` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{award.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{award.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{award.description}</p>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold" style={{ color: award.color }}>
                          {award.cost} coins
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Why Give Awards?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Recognize valuable medical advice and helpful content</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Support doctors and contributors who help the community</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Highlight quality content for other users to find</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">Show appreciation for compassionate and expert responses</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      </div>
    </IridescenceLayout>
  )
}
