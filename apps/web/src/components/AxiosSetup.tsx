'use client'

import { useEffect } from 'react'
import { setupAxiosInterceptors } from '@/utils/axiosConfig'

export function AxiosSetup() {
  useEffect(() => {
    // Setup axios interceptors to handle 401 errors
    setupAxiosInterceptors()
  }, [])

  return null
}
