'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { FileText, Image, Video, Link2, BarChart3, Bold, Italic, List } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Community {
  id: string
  name: string
  displayName: string
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'link' | 'poll'>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [communityId, setCommunityId] = useState('')
  const [communities, setCommunities] = useState<Community[]>([])
  const [flair, setFlair] = useState('')
  const [isNSFW, setIsNSFW] = useState(false)
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  
  // Link post fields
  const [linkUrl, setLinkUrl] = useState('')
  
  // Poll post fields
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [pollDuration, setPollDuration] = useState(3) // days
  
  // Image/Video upload fields
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([])
  
  const { fetchPosts } = useStore()
  const { user, role } = useJWTAuth()
  const router = useRouter()

  // Check if user is an unverified doctor
  const isUnverifiedDoctor = role === 'DOCTOR' && user?.doctorVerificationStatus !== 'APPROVED'

  // Fetch communities on mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/communities`)
        // Handle both response formats
        const communitiesData = response.data.communities || response.data
        setCommunities(Array.isArray(communitiesData) ? communitiesData : [])
        // Set default community
        if (communitiesData.length > 0) {
          setCommunityId(communitiesData[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error)
        setCommunities([])
      } finally {
        setIsLoadingCommunities(false)
      }
    }

    if (isOpen) {
      fetchCommunities()
    }
  }, [isOpen])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file types
    const validTypes = postType === 'image' 
      ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      : postType === 'video'
      ? ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
      : []
    
    const validFiles = files.filter(file => validTypes.includes(file.type))
    
    if (validFiles.length !== files.length) {
      alert(`Please upload only ${postType} files`)
      return
    }
    
    // Limit file size (10MB for images, 100MB for videos)
    const maxSize = postType === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024
    const oversizedFiles = validFiles.filter(file => file.size > maxSize)
    
    if (oversizedFiles.length > 0) {
      alert(`File size must be less than ${postType === 'image' ? '10MB' : '100MB'}`)
      return
    }
    
    setUploadedFiles(validFiles)
    
    // Create previews
    const previews = validFiles.map(file => URL.createObjectURL(file))
    setUploadPreviews(previews)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setUploadPreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ''])
    }
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index))
    }
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  if (!isOpen) return null

  const handleSubmit = async () => {
    // Check if user is an unverified doctor
    if (isUnverifiedDoctor) {
      setVerificationError('Doctor verification required. Please complete the verification process before posting.')
      return
    }

    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    if (!communityId) {
      alert('Please select a community')
      return
    }

    if (!user) {
      alert('Please log in to create a post')
      return
    }

    // Validate based on post type
    if (postType === 'link' && !linkUrl.trim()) {
      alert('Please enter a URL')
      return
    }

    if (postType === 'link') {
      try {
        new URL(linkUrl)
      } catch {
        alert('Please enter a valid URL')
        return
      }
    }

    if (postType === 'poll') {
      const validOptions = pollOptions.filter(opt => opt.trim())
      if (validOptions.length < 2) {
        alert('Please provide at least 2 poll options')
        return
      }
    }

    if ((postType === 'image' || postType === 'video') && uploadedFiles.length === 0) {
      alert(`Please upload at least one ${postType}`)
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('auth_token')
      let mediaUrls: string[] = []

      // Upload files if image/video post
      if ((postType === 'image' || postType === 'video') && uploadedFiles.length > 0) {
        // For now, convert to base64 (in production, use AWS S3 or similar)
        mediaUrls = await Promise.all(
          uploadedFiles.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
          })
        )
      }

      const postData: any = {
        title,
        communityId,
        type: postType.toUpperCase(),
        isNSFW,
        isSpoiler,
        isPrivate,
        flair: flair ? { text: flair } : undefined
      }

      // Add type-specific data
      if (postType === 'text') {
        postData.content = content || undefined
      } else if (postType === 'link') {
        postData.url = linkUrl
        postData.content = content || undefined // Optional description
      } else if (postType === 'image' || postType === 'video') {
        postData.mediaUrls = mediaUrls
        postData.content = content || undefined // Optional caption
      } else if (postType === 'poll') {
        postData.content = JSON.stringify({
          options: pollOptions.filter(opt => opt.trim()),
          duration: pollDuration,
          votes: {},
          totalVotes: 0
        })
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

      // Handle both response formats
      const newPost = response.data.data || response.data

      // Reset form
      setTitle('')
      setContent('')
      setLinkUrl('')
      setPollOptions(['', ''])
      setUploadedFiles([])
      setUploadPreviews([])
      setFlair('')
      setIsNSFW(false)
      setIsSpoiler(false)
      setIsPrivate(false)
      
      onClose()

      // Navigate to the new post (real-time updates will handle showing it in the feed)
      router.push(`/post/${newPost.id}`)
    } catch (error: any) {
      console.error('Failed to create post:', error)
      alert(error.response?.data?.message || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elevated border border-white/20">
        {/* Header */}
        <div className="border-b border-gray-200/50 p-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-charcoal">Create a post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-charcoal transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Verification Warning for Unverified Doctors */}
          {isUnverifiedDoctor && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-1">Doctor Verification Required</h3>
                  <p className="text-sm text-red-800 mb-2">
                    Your doctor account must be verified before you can create posts or comments.
                  </p>
                  <button
                    // onClick={() => {
                    //   onClose()
                    //   router.push('/doctor-verification')
                    // }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  >
                    Complete Verification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Community Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-charcoal">Choose a community</label>
            {isLoadingCommunities ? (
              <div className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-500">
                Loading communities...
              </div>
            ) : communities.length === 0 ? (
              <div className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-500">
                No communities available. Please create one first.
              </div>
            ) : (
              <select
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition"
              >
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    m/{community.name} - {community.displayName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Post Type Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200/50">
            <button
              onClick={() => setPostType('text')}
              className={`px-4 py-2 font-medium rounded-t-xl transition flex items-center gap-2 ${postType === 'text'
                  ? 'bg-yellow-100 text-charcoal'
                  : 'text-gray-600 hover:bg-cream-50/50'
                }`}
            >
              <FileText className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setPostType('image')}
              className={`px-4 py-2 font-medium rounded-t-xl transition flex items-center gap-2 ${postType === 'image'
                  ? 'bg-yellow-100 text-charcoal'
                  : 'text-gray-600 hover:bg-cream-50/50'
                }`}
            >
              <Image className="w-4 h-4" />
              Image
            </button>
            <button
              onClick={() => setPostType('video')}
              className={`px-4 py-2 font-medium rounded-t-xl transition flex items-center gap-2 ${
                postType === 'video'
                  ? 'bg-yellow-100 text-charcoal'
                  : 'text-gray-600 hover:bg-cream-50/50'
              }`}
            >
              <Video className="w-4 h-4" />
              Video
            </button>
            <button
              onClick={() => setPostType('link')}
              className={`px-4 py-2 font-medium rounded-t-xl transition flex items-center gap-2 ${postType === 'link'
                  ? 'bg-yellow-100 text-charcoal'
                  : 'text-gray-600 hover:bg-cream-50/50'
                }`}
            >
              <Link2 className="w-4 h-4" />
              Link
            </button>
            <button
              onClick={() => setPostType('poll')}
              className={`px-4 py-2 font-medium rounded-t-xl transition flex items-center gap-2 ${postType === 'poll'
                  ? 'bg-yellow-100 text-charcoal'
                  : 'text-gray-600 hover:bg-cream-50/50'
                }`}
            >
              <BarChart3 className="w-4 h-4" />
              Poll
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={300}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition"
            />
            <div className="text-xs text-gray-500 mt-1">{title.length}/300</div>
          </div>

          {/* Content based on type */}
          {postType === 'text' && (
            <div className="mb-4">
              <textarea
                placeholder="Text (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 resize-none bg-white/50 backdrop-blur-sm transition"
              />
              <div className="flex gap-2 mt-2">
                <button className="p-2 hover:bg-cream-50/50 rounded-lg transition" title="Bold">
                  <Bold className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-cream-50/50 rounded-lg transition" title="Italic">
                  <Italic className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-cream-50/50 rounded-lg transition" title="Link">
                  <Link2 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-cream-50/50 rounded-lg transition" title="List">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {postType === 'image' && (
            <div className="mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-cream-50/30 mb-4">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 mb-2">Drag and drop images or</p>
                <label className="px-4 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition shadow-soft cursor-pointer inline-block">
                  Upload Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Max 10MB per image</p>
              </div>
              
              {/* Image Previews */}
              {uploadPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {uploadPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <textarea
                placeholder="Caption (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 resize-none bg-white/50 backdrop-blur-sm transition"
              />
            </div>
          )}

          {postType === 'video' && (
            <div className="mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-cream-50/30 mb-4">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 mb-2">Drag and drop video or</p>
                <label className="px-4 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition shadow-soft cursor-pointer inline-block">
                  Upload Video
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Max 100MB • MP4, WebM, MOV</p>
              </div>
              
              {/* Video Preview */}
              {uploadPreviews.length > 0 && (
                <div className="mb-4">
                  <div className="relative">
                    <video 
                      src={uploadPreviews[0]} 
                      controls 
                      className="w-full rounded-lg"
                      style={{ maxHeight: '300px' }}
                    />
                    <button
                      onClick={() => removeFile(0)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {uploadedFiles[0]?.name} ({(uploadedFiles[0]?.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                </div>
              )}
              
              <textarea
                placeholder="Caption (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 resize-none bg-white/50 backdrop-blur-sm transition"
              />
            </div>
          )}

          {postType === 'link' && (
            <div className="mb-4">
              <input
                type="url"
                placeholder="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition mb-3"
              />
              <textarea
                placeholder="Description (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 resize-none bg-white/50 backdrop-blur-sm transition"
              />
            </div>
          )}

          {postType === 'poll' && (
            <div className="mb-4">
              <div className="space-y-2 mb-3">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => removePollOption(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {pollOptions.length < 6 && (
                <button
                  onClick={addPollOption}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition"
                >
                  + Add Option
                </button>
              )}
              
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2 text-charcoal">Poll Duration</label>
                <select
                  value={pollDuration}
                  onChange={(e) => setPollDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition"
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>1 Week</option>
                  <option value={14}>2 Weeks</option>
                </select>
              </div>
            </div>
          )}

          {/* Flair */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-charcoal">Flair (optional)</label>
            <select
              value={flair}
              onChange={(e) => setFlair(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition"
            >
              <option value="">No flair</option>
              <option value="Question">Question</option>
              <option value="Discussion">Discussion</option>
              <option value="Advice">Seeking Advice</option>
              <option value="Update">Update</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* Privacy Toggle - Prominent */}
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-5 h-5 rounded mt-0.5 accent-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-blue-900">Private Post</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    {isPrivate ? 'PRIVATE' : 'PUBLIC'}
                  </span>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  {isPrivate 
                    ? "✓ Only you and verified doctors can see this post. Doctor replies are private to each doctor."
                    : "Everyone can see this post and all replies from doctors."
                  }
                </p>
              </div>
            </label>
          </div>

          {/* Other Options */}
          <div className="mb-4 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNSFW}
                onChange={(e) => setIsNSFW(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-charcoal">Mark as NSFW</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-charcoal">Mark as spoiler</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200/50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-full font-semibold hover:bg-cream-50/50 text-charcoal transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting || !communityId || isUnverifiedDoctor}
              className="flex-1 px-4 py-2.5 bg-charcoal text-white rounded-full font-semibold hover:bg-charcoal-light disabled:opacity-50 disabled:cursor-not-allowed transition shadow-soft hover:shadow-elevated"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}