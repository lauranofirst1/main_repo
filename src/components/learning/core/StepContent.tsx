// 문서 학습 단계별 내용을 통합 관리하는 컴포넌트
// 현재 단계에 따라 적절한 컴포넌트(읽기/요약/퀴즈/통계)를 렌더링
import { type LearningStep } from '@/hooks/paperStore'
import { useState, useMemo, useCallback, useEffect } from 'react'
import ReadingStep from './ReadingStep'
import SummaryStep from './SummaryStep'
import QuizStep from './QuizStep'
import WrongAnswerStep from './WrongAnswerStep'
import StatsStep from '../stats/StatsStep'
import QuizGenerationModal, { QuizGenerationOptions } from '../quiz/QuizGenerationModal'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAIAnalysis } from '@/context/AIAnalysisContext'
import React from 'react'
import { supabase } from '@/lib/supabaseClient'

interface StepContentProps {
  currentStep: LearningStep
  paperId: string
  topicId: string
  isPaperContentCollapsed?: boolean
  onTogglePaperContent?: () => void
  onNavigateToReadingStep?: (contentId?: number, highlightInfo?: { evidence: string; startIndex: number; endIndex: number }) => void
  onShowEvidenceInPaper?: (contentId: number, highlightInfo?: { evidence: string; startIndex: number; endIndex: number }) => void
}

const StepContent = React.memo(function StepContent({ currentStep, paperId, topicId, isPaperContentCollapsed, onTogglePaperContent, onNavigateToReadingStep, onShowEvidenceInPaper }: StepContentProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'self'>('ai')
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [paperTitle, setPaperTitle] = useState<string>('')
  const [isTranslationActive, setIsTranslationActive] = useState(false)
  const { state, startSummaryGeneration, startQuizGeneration, completeSummaryGeneration, completeQuizGeneration } = useAIAnalysis()
  const { isGeneratingSummary, isGeneratingQuiz } = state

  // 문서 제목 가져오기
  useEffect(() => {
    const fetchPaperTitle = async () => {
      try {
        const { data, error } = await supabase
          .from('paper')
          .select('paper_title')
          .eq('paper_id', paperId)
          .single()

        if (!error && data) {
          setPaperTitle(data.paper_title)
        }
      } catch (err) {
        console.error('문서 제목 로드 오류:', err)
      }
    }

    if (paperId) {
      fetchPaperTitle()
    }
  }, [paperId])

  const getStepTitle = useCallback(() => {
    switch (currentStep) {
      case 'reading':
        return '문서 읽기'
      case 'summary':
        return '문서 요약'
      case 'quiz':
        return '문서 퀴즈'
      case 'wrong_answer':
        return '오답노트'
      case 'stats':
        return '학습 통계'
      default:
        return ''
    }
  }, [currentStep])

  // 번역 활성화 상태 확인
  const checkTranslationStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('paper_contents')
        .select('content_text_eng')
        .eq('content_paper_id', paperId)
        .not('content_text_eng', 'is', null)
        .limit(1)

      if (!error && data && data.length > 0) {
        setIsTranslationActive(true)
      } else {
        setIsTranslationActive(false)
      }
    } catch (err) {
      console.error('번역 상태 확인 오류:', err)
      setIsTranslationActive(false)
    }
  }, [paperId])

  // 번역 상태 확인
  useEffect(() => {
    checkTranslationStatus()
  }, [checkTranslationStatus])

  // 퀴즈에서 틀린 문제의 근거로 이동
  const handleNavigateToContent = useCallback((contentId: number, highlightInfo?: { evidence: string; startIndex: number; endIndex: number }) => {
    console.log('퀴즈에서 틀린 문제의 근거로 이동:', contentId, highlightInfo)
    if (onNavigateToReadingStep) {
      onNavigateToReadingStep(contentId, highlightInfo)
    }
  }, [onNavigateToReadingStep])

  const handleGenerateQuiz = useCallback(async (options: QuizGenerationOptions) => {
    try {
              startQuizGeneration(paperId, paperTitle || '문서', topicId)
      console.log('퀴즈 생성 요청 시작:', { paperId, options })
      
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paperId, 
          options: {
            purpose: options.purpose,
            categories: options.categories,
            questionCount: options.questionCount,
            difficulty: options.difficulty,
            questionTypes: options.questionTypes,
            timeLimit: options.timeLimit,
            focusPages: options.focusPages
          }
        }),
      })

      const result = await response.json()
      console.log('퀴즈 생성 응답:', { status: response.status, result })

      if (!response.ok) {
        throw new Error(result.error || '퀴즈 생성에 실패했습니다.')
      }

      completeQuizGeneration()
      
    } catch (err) {
      console.error('퀴즈 생성 오류:', err)
      const errorMessage = err instanceof Error ? err.message : '퀴즈 생성 중 오류가 발생했습니다.'
      alert(`퀴즈 생성 실패: ${errorMessage}`)
    }
  }, [paperId, paperTitle, topicId, startQuizGeneration, completeQuizGeneration])

  const handleGenerateAISummary = useCallback(async () => {
    try {
              startSummaryGeneration(paperId, paperTitle || '문서', topicId)
      console.log('AI 요약 생성 요청 시작:', { paperId })
      
      const response = await fetch('/api/classify-and-summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paperId }),
      })

      const result = await response.json()
      console.log('AI 요약 생성 응답:', { status: response.status, result })

      if (!response.ok) {
        throw new Error(result.error || 'AI 요약 생성에 실패했습니다.')
      }

      completeSummaryGeneration()
      
    } catch (err) {
      console.error('AI 요약 생성 오류:', err)
      const errorMessage = err instanceof Error ? err.message : 'AI 요약 생성 중 오류가 발생했습니다.'
      alert(`AI 요약 생성 실패: ${errorMessage}`)
    }
  }, [paperId, paperTitle, topicId, startSummaryGeneration, completeSummaryGeneration])

  const renderHeader = () => {
    const toggleButton = onTogglePaperContent && (
      <button
        onClick={onTogglePaperContent}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
        title={isPaperContentCollapsed ? "문서 내용 펼치기" : "문서 내용 접기"}
      >
        {isPaperContentCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    )

    switch (currentStep) {
      case 'summary':
        return (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {toggleButton}
              <h3 className="text-lg font-semibold text-gray-800">{getStepTitle()}</h3>
            </div>
            <div className="flex items-center space-x-3">
              {activeTab === 'ai' && (
                <button
                  onClick={handleGenerateAISummary}
                  disabled={isGeneratingSummary}
                  className="text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 rounded-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold flex items-center space-x-2"
                >
                  {isGeneratingSummary ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>생성 중...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>AI 정리노트 생성</span>
                    </>
                  )}
                </button>
              )}
              <div className="flex border border-blue-200 rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`px-4 py-2 text-xs font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === 'ai'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-blue-50'
                  }`}
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🤖</span>
                  </div>
                  <span>AI 전체 정리노트</span>
                </button>
                <button
                  onClick={() => setActiveTab('self')}
                  className={`px-4 py-2 text-xs font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === 'self'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-green-50'
                  }`}
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✏️</span>
                  </div>
                  <span>나의 정리노트</span>
                </button>
              </div>
            </div>
          </div>
        )
      case 'quiz':
        return (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {toggleButton}
              <h3 className="text-lg font-semibold text-gray-800">{getStepTitle()}</h3>
            </div>
            <button
              onClick={() => setShowQuizModal(true)}
              disabled={isGeneratingQuiz}
              className="text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 rounded-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold flex items-center space-x-2"
            >
              {isGeneratingQuiz ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>AI 퀴즈 생성</span>
                </>
              )}
            </button>
          </div>
        )
      case 'stats':
        return (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {toggleButton}
              <h3 className="text-lg font-semibold text-gray-800">{getStepTitle()}</h3>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-3">
            {toggleButton}
            <h3 className="text-lg font-semibold text-gray-800">{getStepTitle()}</h3>
          </div>
        )
    }
  }

        // 문서 읽기 단계에서는 전체 화면 사용
  if (currentStep === 'reading') {
    return <ReadingStep paperId={paperId} topicId={topicId} />
  }

  // 다른 단계에서는 기존 레이아웃 사용
  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm w-full h-full flex flex-col">
      <div className="p-6 border-b border-blue-200 bg-white/50 backdrop-blur-sm rounded-t-xl">
        {renderHeader()}
      </div>
      <div className="flex-1 p-6 overflow-hidden">
        {currentStep === 'summary' && <SummaryStep paperId={paperId} activeTab={activeTab} />}
                               {currentStep === 'quiz' && (
          <QuizStep 
            paperId={paperId} 
            onNavigateToContent={onNavigateToReadingStep}
            onShowEvidenceInPaper={onShowEvidenceInPaper}
            isTranslationActive={isTranslationActive}
          />
        )}
        {currentStep === 'wrong_answer' && (
          <WrongAnswerStep 
            paperId={paperId} 
            onShowEvidenceInPaper={onShowEvidenceInPaper}
            isTranslationActive={isTranslationActive}
          />
        )}
        {currentStep === 'stats' && <StatsStep paperId={paperId} />}
      </div>

      {/* 퀴즈 생성 모달 */}
      <QuizGenerationModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        onGenerate={handleGenerateQuiz}
        paperId={paperId}
      />
    </div>
  )
})

export default StepContent 