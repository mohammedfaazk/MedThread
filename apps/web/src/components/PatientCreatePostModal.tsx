'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useStore } from '@/store/useStore'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface PatientCreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Community {
  id: string
  name: string
  displayName: string
}

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea',
  'Chest Pain', 'Shortness of Breath', 'Dizziness', 'Back Pain',
  'Sore Throat', 'Body Aches', 'Vomiting', 'Rash', 'Joint Pain',
  'Stomach Pain', 'Loss of Appetite', 'Chills', 'Sweating',
]

const DURATION_OPTIONS = [
  { value: 'less_than_day', label: 'Less than a day' },
  { value: '1-3_days',      label: '1–3 days' },
  { value: '4-7_days',      label: '4–7 days' },
  { value: '1-2_weeks',     label: '1–2 weeks' },
  { value: 'more_than_2_weeks', label: 'More than 2 weeks' },
]

export function PatientCreatePostModal({ isOpen, onClose }: PatientCreatePostModalProps) {
  const [step, setStep] = useState(1)
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1 — basic info
  const [age, setAge]       = useState('')
  const [gender, setGender] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [communityId, setCommunityId] = useState('')

  // Step 2 — symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [duration, setDuration] = useState('')
  const [existingConditions, setExistingConditions] = useState('')
  const [medications, setMedications] = useState('')

  // Step 3 — description & privacy
  const [title, setTitle]         = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const { user } = useJWTAuth()
  const { fetchPosts } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return
    setIsLoadingCommunities(true)
    axios.get(`${API_URL}/api/v1/communities`)
      .then(res => {
        const data = res.data.communities || res.data
        const list = Array.isArray(data) ? data : []
        setCommunities(list)
        if (list.length > 0) setCommunityId(list[0].id)
      })
      .catch(() => setCommunities([]))
      .finally(() => setIsLoadingCommunities(false))
  }, [isOpen])

  const resetForm = () => {
    setStep(1)
    setAge(''); setGender(''); setWeight(''); setHeight('')
    setSelectedSymptoms([]); setDuration(''); setExistingConditions(''); setMedications('')
    setTitle(''); setDescription(''); setIsPrivate(false)
  }

  const handleClose = () => { resetForm(); onClose() }

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )

  const handleSubmit = async () => {
    if (!title.trim()) { alert('Please enter a title'); return }
    if (!communityId)  { alert('Please select a community'); return }
    if (!user)         { alert('Please log in'); return }

    // Build a structured content block
    const lines: string[] = []
    if (age || gender || weight || height) {
      lines.push('**Patient Info:**')
      if (age)    lines.push(`- Age: ${age}`)
      if (gender) lines.push(`- Gender: ${gender}`)
      if (weight) lines.push(`- Weight: ${weight} kg`)
      if (height) lines.push(`- Height: ${height} cm`)
    }
    if (selectedSymptoms.length > 0) {
      lines.push('')
      lines.push(`**Symptoms:** ${selectedSymptoms.join(', ')}`)
    }
    if (duration) {
      const label = DURATION_OPTIONS.find(d => d.value === duration)?.label ?? duration
      lines.push(`**Duration:** ${label}`)
    }
    if (existingConditions.trim()) lines.push(`**Existing Conditions:** ${existingConditions}`)
    if (medications.trim())        lines.push(`**Current Medications:** ${medications}`)
    if (description.trim()) {
      lines.push('')
      lines.push('**Description:**')
      lines.push(description)
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${API_URL}/api/v1/posts`,
        {
          title,
          content: lines.join('\n'),
          communityId,
          type: 'TEXT',
          isPrivate,
          flair: { text: 'Question' },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const newPost = response.data.data || response.data

      // Fire-and-forget: create SymptomReport from chip-selected symptoms
      if (selectedSymptoms.length > 0 && newPost?.id) {
        axios.post(
          `${API_URL}/api/regional-symptom-analytics/report-from-post`,
          { postId: newPost.id, symptoms: selectedSymptoms, duration },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => {/* non-critical */})

        // Fire-and-forget: analyze post priority from structured chip data
        axios.post(
          `${API_URL}/api/post-priority/analyze-from-chips/${newPost.id}`,
          {
            symptoms: selectedSymptoms,
            duration,
            existingConditions,
            description,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => {/* non-critical */})
      }

      handleClose()
      router.push(`/post/${newPost.id}`)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const stepLabel = ['Basic Info', 'Symptoms', 'Description']

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-elevated border border-white/20">

        {/* Header */}
        <div className="border-b border-gray-200/50 p-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">Ask a Question</h2>
            <p className="text-xs text-gray-500 mt-0.5">Step {step} of 3 — {stepLabel[step - 1]}</p>
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-charcoal transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 px-4 pt-3">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-cyan-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="p-4 space-y-4">

          {/* ── STEP 1: Basic Info ── */}
          {step === 1 && (
            <>
              {/* Community */}
              <div>
                <label className="block text-sm font-medium mb-1 text-charcoal">Community</label>
                {isLoadingCommunities ? (
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-400 text-sm">Loading…</div>
                ) : (
                  <select
                    value={communityId}
                    onChange={e => setCommunityId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 bg-white/50 text-sm"
                  >
                    {communities.map(c => (
                      <option key={c.id} value={c.id}>m/{c.name} — {c.displayName}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-charcoal">Age</label>
                  <input type="number" value={age} onChange={e => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 bg-white/50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-charcoal">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 bg-white/50 text-sm">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-charcoal">Weight (kg)</label>
                  <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                    placeholder="e.g. 65"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 bg-white/50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-charcoal">Height (cm)</label>
                  <input type="number" value={height} onChange={e => setHeight(e.target.value)}
                    placeholder="e.g. 170"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 bg-white/50 text-sm" />
                </div>
              </div>

              <button onClick={() => setStep(2)}
                className="w-full py-2.5 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition shadow-sm">
                Continue →
              </button>
            </>
          )}

          {/* ── STEP 2: Symptoms ── */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-charcoal">Select your symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSymptom(s)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedSymptoms.includes(s)
                          ? 'bg-cyan-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-charcoal">Duration</label>
                <select value={duration} onChange={e => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 bg-white/50 text-sm">
                  <option value="">Select duration</option>
                  {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-charcoal">Existing conditions (optional)</label>
                <input type="text" value={existingConditions} onChange={e => setExistingConditions(e.target.value)}
                  placeholder="e.g. Diabetes, Hypertension"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 bg-white/50 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-charcoal">Current medications (optional)</label>
                <input type="text" value={medications} onChange={e => setMedications(e.target.value)}
                  placeholder="e.g. Metformin, Aspirin"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 bg-white/50 text-sm" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition text-sm">
                  ← Back
                </button>
                <button onClick={() => setStep(3)}
                  disabled={selectedSymptoms.length === 0}
                  className="flex-1 py-2.5 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm text-sm">
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Description & Post ── */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-charcoal">Post title <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  maxLength={300}
                  placeholder="Briefly describe your concern…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 bg-white/50 text-sm" />
                <div className="text-xs text-gray-400 mt-0.5 text-right">{title.length}/300</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-charcoal">Describe in detail (optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  rows={5} placeholder="Provide as much detail as possible — when it started, what makes it better or worse, any other relevant info…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 resize-none bg-white/50 text-sm" />
              </div>

              {/* Privacy toggle */}
              <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded mt-0.5 accent-blue-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-900">Private Post</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {isPrivate ? 'PRIVATE' : 'PUBLIC'}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-0.5">
                      {isPrivate
                        ? 'Only you and verified doctors can see this post.'
                        : 'Everyone can see this post and all doctor replies.'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition text-sm">
                  ← Back
                </button>
                <button onClick={handleSubmit}
                  disabled={!title.trim() || isSubmitting || !communityId}
                  className="flex-1 py-2.5 bg-charcoal text-white rounded-full font-semibold hover:bg-charcoal-light disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm text-sm">
                  {isSubmitting ? 'Posting…' : 'Post Question'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
