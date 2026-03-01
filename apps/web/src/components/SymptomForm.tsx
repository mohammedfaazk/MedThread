'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface SymptomFormProps {
  onDataChange: (data: any) => void
  onAnalysisReceived: (analysis: any) => void
}

export function SymptomForm({ onDataChange, onAnalysisReceived }: SymptomFormProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [communities, setCommunities] = useState<any[]>([])
  const [loadingCommunities, setLoadingCommunities] = useState(true)
  const router = useRouter()
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    existingConditions: [] as string[],
    medications: [] as string[],
    primarySymptoms: [] as string[],
    duration: '',
    description: '',
    isPrivate: false,
    communityId: '' // Add community selection
  })

  // Fetch communities on mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/communities`)
        const communitiesData = response.data.communities || response.data
        setCommunities(Array.isArray(communitiesData) ? communitiesData : [])
        // Set default community
        if (communitiesData.length > 0) {
          setFormData(prev => ({ ...prev, communityId: communitiesData[0].id }))
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error)
        setCommunities([])
      } finally {
        setLoadingCommunities(false)
      }
    }

    fetchCommunities()
  }, [])

  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea',
    'Chest Pain', 'Shortness of Breath', 'Dizziness', 'Back Pain'
  ]

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      primarySymptoms: prev.primarySymptoms.includes(symptom)
        ? prev.primarySymptoms.filter(s => s !== symptom)
        : [...prev.primarySymptoms, symptom]
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.description.trim()) {
      alert('Please provide a description of your symptoms')
      return
    }

    if (formData.primarySymptoms.length === 0) {
      alert('Please select at least one symptom')
      return
    }

    if (!formData.communityId) {
      alert('Please select a community')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please log in to create a post')
        router.push('/login')
        return
      }

      // Create title from symptoms
      const title = formData.primarySymptoms.length > 0
        ? `${formData.primarySymptoms.slice(0, 3).join(', ')}${formData.primarySymptoms.length > 3 ? ' and more' : ''}`
        : 'Medical Consultation Request'

      // Format duration nicely
      const durationMap: Record<string, string> = {
        'less_than_day': 'Less than a day',
        '1-3_days': '1-3 days',
        '4-7_days': '4-7 days',
        '1-2_weeks': '1-2 weeks',
        'more_than_2_weeks': 'More than 2 weeks'
      }
      const durationText = durationMap[formData.duration] || 'Not specified'

      // Build readable content
      const content = `${formData.description}

---

📋 **Patient Details**
${formData.age ? `Age: ${formData.age} years` : ''}${formData.gender ? ` • Gender: ${formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)}` : ''}${formData.weight ? ` • Weight: ${formData.weight} kg` : ''}

🩺 **Symptoms Experienced**
${formData.primarySymptoms.map(s => `• ${s}`).join('\n')}

⏱️ **Duration**: ${durationText}
${formData.isPrivate ? '\n🔒 **Private Consultation** - Only visible to verified doctors' : ''}`

      // Create the post
      const postData = {
        title,
        content,
        communityId: formData.communityId,
        type: 'TEXT',
        isNSFW: false,
        isSpoiler: false,
        isPrivate: formData.isPrivate, // Add privacy flag
        flair: { text: formData.isPrivate ? '🔒 Private' : '💬 Consultation' }
      }

      const response = await axios.post(
        `${API_URL}/api/v1/posts`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const newPost = response.data

      // Success!
      alert('Post created successfully!')
      
      // Navigate to homepage to see the post
      router.push('/')
    } catch (error: any) {
      console.error('Failed to create post:', error)
      alert(error.response?.data?.message || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-soft border border-white/20">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition ${i <= step ? 'bg-yellow-200' : 'bg-gray-200/50'
                }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">Step {step} of 3</p>
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-charcoal">Basic Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-charcoal">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-200 focus:border-transparent bg-white/50 backdrop-blur-sm transition"
                placeholder="Enter age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-charcoal">Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-200 focus:border-transparent bg-white/50 backdrop-blur-sm transition"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-charcoal">Weight (kg)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={e => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-200 focus:border-transparent bg-white/50 backdrop-blur-sm transition"
              placeholder="Enter weight"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-all font-semibold shadow-soft hover:shadow-elevated"
          >
            Continue
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-charcoal">Symptoms</h2>

          <div>
            <label className="block text-sm font-medium mb-3 text-charcoal">Select your symptoms</label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-4 py-2 rounded-full transition-all ${formData.primarySymptoms.includes(symptom)
                      ? 'bg-yellow-200 text-charcoal shadow-soft'
                      : 'bg-cream-100/50 text-gray-700 hover:bg-cream-100'
                    }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-charcoal">Duration</label>
            <select
              value={formData.duration}
              onChange={e => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-200 focus:border-transparent bg-white/50 backdrop-blur-sm transition"
            >
              <option value="">Select duration</option>
              <option value="less_than_day">Less than a day</option>
              <option value="1-3_days">1-3 days</option>
              <option value="4-7_days">4-7 days</option>
              <option value="1-2_weeks">1-2 weeks</option>
              <option value="more_than_2_weeks">More than 2 weeks</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-full hover:bg-cream-50/50 transition-all font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-all font-semibold shadow-soft hover:shadow-elevated"
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-charcoal">Additional Details</h2>

          {/* Community Selector */}
          <div>
            <label className="block text-sm font-medium mb-2 text-charcoal">Choose a community</label>
            {loadingCommunities ? (
              <div className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-500">
                Loading communities...
              </div>
            ) : communities.length === 0 ? (
              <div className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-500">
                No communities available
              </div>
            ) : (
              <select
                value={formData.communityId}
                onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-200 focus:border-transparent bg-white/50 backdrop-blur-sm transition"
              >
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    m/{community.name} - {community.displayName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Privacy Mode Selector */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
            <label className="block text-sm font-medium mb-3 text-charcoal">Post Privacy</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPrivate: false })}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  !formData.isPrivate
                    ? 'border-cyan-500 bg-cyan-50 shadow-soft'
                    : 'border-gray-200 bg-white/50 hover:bg-white/80'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🌐</span>
                  <span className="font-semibold text-charcoal">Public</span>
                </div>
                <p className="text-xs text-gray-600">
                  Visible to all users and doctors
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPrivate: true })}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  formData.isPrivate
                    ? 'border-red-500 bg-red-50 shadow-soft'
                    : 'border-gray-200 bg-white/50 hover:bg-white/80'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🔒</span>
                  <span className="font-semibold text-charcoal">Private</span>
                </div>
                <p className="text-xs text-gray-600">
                  Only visible to doctors
                </p>
              </button>
            </div>
            
            {/* Privacy Warning */}
            {formData.isPrivate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-800">
                  <strong>⚠️ Private Post:</strong> Only approved doctors can see this post. 
                  Each doctor's reply will be private and isolated from other doctors' replies. 
                  Only you will see all replies.
                </p>
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-charcoal">
              Describe your symptoms in detail
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-200 focus:border-transparent bg-white/50 backdrop-blur-sm transition"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-full hover:bg-cream-50/50 transition-all font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.description.trim() || formData.primarySymptoms.length === 0}
              className="flex-1 py-3 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-all font-semibold shadow-soft hover:shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
