'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Activity, Calendar, Sparkles } from 'lucide-react'
import { ECGAnimation } from './ECGAnimation'

interface DashboardHeroBannerProps {
  userName: string
  healthProgress?: number
  userRole?: 'patient' | 'doctor'
}

export function DashboardHeroBanner({ 
  userName, 
  healthProgress = 65,
  userRole = 'patient'
}: DashboardHeroBannerProps) {
  const router = useRouter()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.02,
      y: -2,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#E6F4FF] via-white to-[#FFF4CC] p-8 md:p-10 shadow-xl border border-white/40"
    >
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-10 left-10 w-32 h-32 bg-blue-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
          className="absolute bottom-10 right-20 w-40 h-40 bg-yellow-200 rounded-full blur-3xl"
        />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Content */}
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">AI-Powered Health Companion</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Welcome back,{' '}
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                {userName}
              </motion.span>
            </h1>

            <p className="text-lg text-gray-600 font-medium">
              Your AI-powered health companion
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            {/* Health Progress Insight */}
            <div className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-blue-100/50 shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Weekly Health Goals</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${healthProgress}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    />
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-sm font-bold text-blue-600"
                  >
                    {healthProgress}%
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            <motion.button
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => router.push('/symptom-checker')}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold shadow-lg overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="relative flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Check Symptoms
              </span>
              <motion.div
                className="absolute inset-0 rounded-xl"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(6, 182, 212, 0)',
                    '0 0 0 8px rgba(6, 182, 212, 0)',
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            </motion.button>

            <motion.button
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => router.push('/appointments')}
              className="group relative px-6 py-3 bg-white/80 backdrop-blur-sm text-blue-600 rounded-xl font-semibold shadow-md border border-blue-200 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="relative flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Book Appointment
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* Right Side - ECG Animation */}
        <motion.div
          variants={itemVariants}
          className="relative h-[300px] lg:h-[350px] flex items-center justify-center"
        >
          <ECGAnimation />
        </motion.div>
      </div>
    </motion.div>
  )
}
