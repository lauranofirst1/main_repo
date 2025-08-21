'use client'

import { useAIAnalysis } from '@/context/AIAnalysisContext'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AIProgressIndicator() {
  const { state } = useAIAnalysis()
  const { isGeneratingSummary, isGeneratingQuiz, isTranslating, progress, messages, currentPaperId, currentTopicId } = state
  const router = useRouter()

  // 진행 중인 작업이나 완료 메시지가 없으면 표시하지 않음
  if (!isGeneratingSummary && !isGeneratingQuiz && !isTranslating && 
      !messages.summary && !messages.quiz && !messages.translation) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
                        {(isGeneratingSummary || messages.summary) && (
                    <div 
                      className={`bg-white rounded-lg shadow-lg border border-blue-200 p-3 min-w-64 ${
                        !isGeneratingSummary && messages.summary ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
                      }`}
                      onClick={() => {
                        if (!isGeneratingSummary && messages.summary && currentPaperId && currentTopicId) {
                          // 문서 상세 페이지로 이동
                          router.push(`/topics/${currentTopicId}/${currentPaperId}`)
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        {isGeneratingSummary ? (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {isGeneratingSummary ? 'AI 정리노트 생성 중' : 'AI 정리노트 생성 완료'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ease-out relative ${
                              isGeneratingSummary 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                                : 'bg-gradient-to-r from-green-500 to-blue-600'
                            }`}
                            style={{ width: `${progress.summary}%` }}
                          >
                            {isGeneratingSummary && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-600 truncate max-w-48">
                            {messages.summary && messages.summary.length > 30 
                              ? `${messages.summary.substring(0, 30)}...` 
                              : messages.summary}
                          </span>
                          <span className="text-xs font-medium text-blue-600">{progress.summary}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                        {(isGeneratingQuiz || messages.quiz) && (
                    <div 
                      className={`bg-white rounded-lg shadow-lg border border-purple-200 p-3 min-w-64 ${
                        !isGeneratingQuiz && messages.quiz ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
                      }`}
                      onClick={() => {
                        if (!isGeneratingQuiz && messages.quiz && currentPaperId && currentTopicId) {
                          // 문서 상세 페이지로 이동
                          router.push(`/topics/${currentTopicId}/${currentPaperId}`)
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        {isGeneratingQuiz ? (
                          <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {isGeneratingQuiz ? 'AI 퀴즈 생성 중' : 'AI 퀴즈 생성 완료'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ease-out relative ${
                              isGeneratingQuiz 
                                ? 'bg-gradient-to-r from-purple-500 to-blue-600' 
                                : 'bg-gradient-to-r from-green-500 to-purple-600'
                            }`}
                            style={{ width: `${progress.quiz}%` }}
                          >
                            {isGeneratingQuiz && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-600 truncate max-w-48">
                            {messages.quiz && messages.quiz.length > 30 
                              ? `${messages.quiz.substring(0, 30)}...` 
                              : messages.quiz}
                          </span>
                          <span className="text-xs font-medium text-purple-600">{progress.quiz}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                        {(isTranslating || messages.translation) && (
                    <div 
                      className={`bg-white rounded-lg shadow-lg border border-green-200 p-3 min-w-64 ${
                        !isTranslating && messages.translation ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
                      }`}
                      onClick={() => {
                        if (!isTranslating && messages.translation && currentPaperId && currentTopicId) {
                          // 문서 상세 페이지로 이동
                          router.push(`/topics/${currentTopicId}/${currentPaperId}`)
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        {isTranslating ? (
                          <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {isTranslating ? '번역 생성 중' : '번역 생성 완료'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ease-out relative ${
                              isTranslating 
                                ? 'bg-gradient-to-r from-green-500 to-blue-600' 
                                : 'bg-gradient-to-r from-green-500 to-blue-600'
                            }`}
                            style={{ width: `${progress.translation}%` }}
                          >
                            {isTranslating && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-600 truncate max-w-48">
                            {messages.translation && messages.translation.length > 30 
                              ? `${messages.translation.substring(0, 30)}...` 
                              : messages.translation}
                          </span>
                          <span className="text-xs font-medium text-green-600">{progress.translation}%</span>
                        </div>
                      </div>
                    </div>
                  )}
    </div>
  )
} 