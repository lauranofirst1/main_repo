'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'

export default function TopBar() {
  const router = useRouter()

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* StudyWithAI 로고 */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 
            className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/topics')}
          >
            StudyWithAI
          </h1>
        </div>
      </div>
    </div>
  )
} 