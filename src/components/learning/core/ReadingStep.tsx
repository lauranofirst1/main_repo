// 문서 읽기 단계를 표시하는 컴포넌트
'use client'

import PaperContent from '@/components/paper/PaperContent'

interface ReadingStepProps {
  paperId: string
  topicId: string
  targetContentId?: number
  targetHighlightInfo?: { evidence: string; startIndex: number; endIndex: number }
}

export default function ReadingStep({ paperId, topicId, targetContentId, targetHighlightInfo }: ReadingStepProps) {
  return (
    <div className="h-full">
      <PaperContent paperId={paperId} topicId={topicId} targetContentId={targetContentId} targetHighlightInfo={targetHighlightInfo} />
    </div>
  )
} 