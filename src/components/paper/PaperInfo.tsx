// 문서 정보를 표시하는 공통 컴포넌트
'use client'

import { Paper } from '@/models/paper'

interface PaperInfoProps {
  paper: Paper
  showAbstract?: boolean
  className?: string
}

export default function PaperInfo({ paper, showAbstract = true, className = '' }: PaperInfoProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">{paper.paper_title}</h2>
        {showAbstract && paper.paper_abstract && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">설명</h3>
            <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
              <div className="line-clamp-4">{paper.paper_abstract}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 