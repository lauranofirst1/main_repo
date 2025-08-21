// 문서 내용을 표시하는 컴포넌트
// ReadingStep 컴포넌트를 재사용하여 문서 정보와 PDF를 표시
'use client'


import { useState, useEffect, useCallback, useMemo } from 'react'
import { PaperContent as PaperContentType } from '@/models/paper_contents'
import { Paper } from '@/models/paper'
import PaperInfo from './PaperInfo'
import ReactMarkdown from 'react-markdown'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabaseClient'
import { useAIAnalysis } from '@/context/AIAnalysisContext'
import { useHighlights } from '@/hooks/useHighlights'
import Highlighter from '@/components/ui/Highlighter'
import React from 'react'

// PdfViewer를 동적으로 import하여 SSR 문제 해결
const PdfViewer = dynamic(() => import('../pdf/PdfViewer'), { ssr: false })

interface PaperContentProps {
  paperId: string
  topicId: string
  isCollapsed?: boolean
  targetContentId?: number
  targetHighlightInfo?: { evidence: string; startIndex: number; endIndex: number }
}

const PaperContent = React.memo(function PaperContent({ paperId, topicId, isCollapsed = false, targetContentId, targetHighlightInfo }: PaperContentProps) {
  const [contents, setContents] = useState<PaperContentType[]>([])
  const [paper, setPaper] = useState<Paper | null>(null)
  const [paperTitle, setPaperTitle] = useState<string>('')

  const [activeTab, setActiveTab] = useState<'original' | 'translation'>('original')
  const [currentPage, setCurrentPage] = useState(0)
  
  // 전체 문서 검색 결과를 저장할 상태
  const [processedTargetHighlightInfo, setProcessedTargetHighlightInfo] = useState<{ evidence: string; startIndex: number; endIndex: number } | undefined>(undefined)
  const [scrollToHighlightId, setScrollToHighlightId] = useState<string | null>(null)
  
  const { state, startTranslation, completeTranslation } = useAIAnalysis()
  const { isTranslating, messages } = state

  // 하이라이트 기능
  const { highlights, createHighlight, deleteHighlight, loading: highlightsLoading, error: highlightsError } = useHighlights({
    paperId
  })

  // 메모이제이션된 하이라이트 데이터
  const memoizedHighlights = useMemo(() => 
    highlights.map(h => ({
      id: h.highlight_id.toString(),
      text: h.highlight_text,
      color: h.highlight_color,
      startOffset: h.highlight_start_offset,
      endOffset: h.highlight_end_offset,
      contentId: h.highlight_content_id?.toString()
    })), [highlights]
  )

  const fetchContents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('paper_contents')
        .select('*')
        .eq('content_paper_id', paperId)
        .order('content_index', { ascending: true })

      if (error) {
        console.error('문서 내용 로드 오류:', error)
      } else {
        setContents(data || [])
      }
    } catch (err) {
              console.error('문서 내용 로드 오류:', err)
    }
  }, [paperId])

  const fetchPaper = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('paper')
        .select('*')
        .eq('paper_id', paperId)
        .single()

      if (error) {
        console.error('문서 정보 로드 오류:', error)
      } else {
        setPaper(data)
        setPaperTitle(data?.paper_title || '')
      }
    } catch (err) {
              console.error('문서 정보 로드 오류:', err)
    }
  }, [paperId])

  useEffect(() => {
    fetchContents()
    fetchPaper()
  }, [fetchContents, fetchPaper])

  // targetContentId가 있을 때 해당 페이지로 이동
  useEffect(() => {
    console.log('PaperContent targetContentId 변경됨:', targetContentId)
    if (targetContentId && contents.length > 0) {
      console.log('타겟 페이지 이동 시도:', { targetContentId, contents: contents.map(c => c.content_id) })
      
      // targetContentId가 0이거나 유효하지 않은 경우 첫 번째 페이지로 이동
      let targetIndex = contents.findIndex(content => content.content_id === targetContentId)
      
      if (targetIndex === -1) {
        console.log('해당 content_id를 찾을 수 없어 첫 번째 페이지로 이동:', targetContentId)
        targetIndex = 0
      }
      
      if (targetIndex !== -1) {
        setCurrentPage(targetIndex)
        // 번역 탭으로 자동 전환
        setActiveTab('translation')
        console.log('페이지 이동 완료:', targetIndex)
      }
    }
  }, [targetContentId, contents])

        // targetHighlightInfo가 있을 때 전체 문서에서 근거 검색
  useEffect(() => {
    if (targetHighlightInfo && contents.length > 0) {
      console.log('PaperContent에서 targetHighlightInfo 받음:', targetHighlightInfo)
      
              // 전체 문서에서 근거 검색
      const searchEvidenceInAllPages = async () => {
        const evidence = targetHighlightInfo.evidence
        
        // 모든 페이지의 번역된 텍스트에서 검색
        for (let i = 0; i < contents.length; i++) {
          const content = contents[i]
          if (content.content_text_eng) {
            const text = content.content_text_eng
            
            // 1. 정확한 매칭 시도
            let index = text.indexOf(evidence)
            
            // 2. 정규화된 매칭 시도
            if (index === -1) {
              const normalizedEvidence = evidence.replace(/\s+/g, ' ').trim()
              const normalizedText = text.replace(/\s+/g, ' ').trim()
              index = normalizedText.indexOf(normalizedEvidence)
            }
            
            // 3. 부분 매칭 시도 (60% 이상 일치)
            if (index === -1) {
              const words = evidence.split(/\s+/).filter(word => word.length > 2)
              if (words.length > 0) {
                let bestMatch = { index: -1, score: 0 }
                
                for (let j = 0; j <= text.length - 10; j++) {
                  const substring = text.substring(j, j + evidence.length + 20)
                  let matchCount = 0
                  
                  for (const word of words) {
                    if (substring.includes(word)) {
                      matchCount++
                    }
                  }
                  
                  const score = matchCount / words.length
                  if (score > bestMatch.score && score >= 0.6) {
                    bestMatch = { index: j, score }
                  }
                }
                
                if (bestMatch.score >= 0.6) {
                  index = bestMatch.index
                  console.log(`페이지 ${i}에서 부분 매칭 성공:`, { score: bestMatch.score, evidence })
                }
              }
            }
            
            if (index !== -1) {
              console.log(`근거를 페이지 ${i}에서 찾았습니다! content_id: ${content.content_id}`)
              
              // 해당 페이지로 이동
              setCurrentPage(i)
              setActiveTab('translation')
              
              // 처리된 targetHighlightInfo 설정 (Highlighter에 전달할 용도)
              setProcessedTargetHighlightInfo({
                evidence: targetHighlightInfo.evidence,
                startIndex: index,
                endIndex: index + targetHighlightInfo.evidence.length
              })
              
              return
            }
          }
        }
        
                  console.log('전체 문서에서 근거를 찾을 수 없습니다:', evidence)
        // 찾지 못한 경우에도 processedTargetHighlightInfo 설정 (Highlighter에서 처리)
        setProcessedTargetHighlightInfo(targetHighlightInfo)
      }
      
      searchEvidenceInAllPages()
    } else {
      // targetHighlightInfo가 없으면 processedTargetHighlightInfo도 초기화
      setProcessedTargetHighlightInfo(undefined)
    }
  }, [targetHighlightInfo, contents])

  // scrollToHighlightId가 설정되면 해당 하이라이트로 스크롤
  useEffect(() => {
    if (scrollToHighlightId) {
      // 하이라이트가 렌더링될 시간을 기다린 후 스크롤
      const timer = setTimeout(() => {
        const highlightElement = document.querySelector(`[data-highlight-id="${scrollToHighlightId}"]`)
        if (highlightElement) {
          highlightElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
          // 하이라이트 요소에 잠깐 포커스 효과 추가
          highlightElement.classList.add('ring-2', 'ring-yellow-400', 'ring-opacity-75')
          setTimeout(() => {
            highlightElement.classList.remove('ring-2', 'ring-yellow-400', 'ring-opacity-75')
          }, 2000)
        }
        // 스크롤 완료 후 ID 초기화
        setScrollToHighlightId(null)
      }, 800) // 하이라이트 렌더링 완료 대기
      
      return () => clearTimeout(timer)
    }
  }, [scrollToHighlightId])

  const handleTranslate = useCallback(async () => {
    try {
              startTranslation(paperId, paperTitle || '문서', topicId)

      const response = await fetch('/api/translate-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paperId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '번역에 실패했습니다.')
      }

      completeTranslation()
      
      // 번역 후 데이터 새로고침
      fetchContents()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '번역 중 오류가 발생했습니다.'
      console.error('번역 오류:', errorMessage)
    }
  }, [paperId, paperTitle, topicId, startTranslation, completeTranslation, fetchContents])


  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1)
    } else if (direction === 'next' && currentPage < contents.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }



  const handleTabChange = (tab: 'original' | 'translation') => {
    setActiveTab(tab)
    if (tab === 'translation') {
      setCurrentPage(0) // 번역 모드 전환 시 첫 페이지로
    }
  }

  // 접힌 상태일 때의 UI
  if (isCollapsed) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm w-full h-full flex flex-col border border-blue-100">
        <div className="p-3 border-b border-blue-200">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">📄</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="text-xs text-gray-500 text-center font-medium">
            접힘 상태
          </div>
          <div className="text-[10px] text-gray-400 text-center">
            펼치려면<br />클릭하세요
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm w-full h-full flex flex-col">
      <div className="p-6 border-b border-blue-200 bg-white/50 backdrop-blur-sm rounded-t-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">📄</span>
            </div>
                          <h3 className="text-xl font-semibold text-gray-800">문서 내용</h3>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === 'translation' && (
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold flex items-center space-x-2"
              >
                {isTranslating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>번역 중...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>AI 번역</span>
                  </>
                )}
              </button>
            )}
            <div className="flex border border-blue-200 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => handleTabChange('original')}
                className={`px-4 py-2 text-xs font-medium transition-all duration-200 ${
                  activeTab === 'original'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-blue-50'
                }`}
              >
                📄 원문 보기
              </button>
              <button
                onClick={() => handleTabChange('translation')}
                className={`px-4 py-2 text-xs font-medium transition-all duration-200 ${
                  activeTab === 'translation'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-green-50'
                }`}
              >
                🌐 번역 보기
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {messages.translation && (
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm border-b border-blue-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">💬</span>
            </div>
            <span className="font-medium">{messages.translation}</span>
          </div>
        </div>
      )}

      {/* 하이라이트 상태 표시 */}
      {highlightsError && (
        <div className="px-6 py-3 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 text-sm border-b border-red-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">⚠️</span>
            </div>
            <span className="font-medium">하이라이트 오류: {highlightsError}</span>
          </div>
        </div>
      )}

      {highlightsLoading && (
        <div className="px-6 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 text-sm border-b border-yellow-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">⏳</span>
            </div>
            <span className="font-medium">하이라이트 저장 중...</span>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 overflow-hidden">
        {activeTab === 'translation' ? (
          <div className="h-full flex flex-col">
            {contents.length > 0 ? (
              <>
                {/* 페이지네이션 헤더 */}
                <div className="flex justify-between items-center mb-6 px-2">
                  <button
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 0}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-semibold flex items-center space-x-2"
                  >
                    <span>←</span>
                    <span>이전</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{currentPage + 1}</span>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      / {contents.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === contents.length - 1}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-semibold flex items-center space-x-2"
                  >
                    <span>다음</span>
                    <span>→</span>
                  </button>
                </div>
                
                {/* 모든 페이지 내용을 하나의 Highlighter로 관리 */}
                <div className="flex-1 overflow-y-auto">
                  <Highlighter
                    key={`highlighter-${currentPage}`}
                    currentContentId={contents[currentPage].content_id?.toString()}
                    initialHighlights={memoizedHighlights}
                    targetHighlightInfo={processedTargetHighlightInfo}
                    onNavigateToPage={(contentId, highlightInfo) => {
                      // 해당 contentId의 페이지로 이동
                      const targetPageIndex = contents.findIndex(content => content.content_id === parseInt(contentId))
                      if (targetPageIndex !== -1) {
                        setCurrentPage(targetPageIndex)
                        
                        // 하이라이트 정보가 있으면 스크롤할 하이라이트 ID 설정
                        if (highlightInfo) {
                          setScrollToHighlightId(highlightInfo.highlightId)
                        }
                      }
                    }}
                    onDeleteHighlight={async (highlightId) => {
                      // 하이라이트 ID를 숫자로 변환하여 deleteHighlight 호출
                      const numericId = typeof highlightId === 'string' ? parseInt(highlightId) : highlightId
                      if (!isNaN(numericId)) {
                        await deleteHighlight(numericId)
                      }
                    }}
                    onHighlightChange={async (newHighlights) => {
                      // 성능 최적화: 디바운싱 적용
                      const timeoutId = setTimeout(async () => {
                        console.log('하이라이트 저장 요청:', newHighlights)
                        
                        // 기존 하이라이트 ID를 Set으로 변환하여 검색 성능 향상
                        const existingHighlightIds = new Set(highlights.map(h => h.highlight_id.toString()))
                        
                        // 새로운 하이라이트만 필터링
                        const highlightsToSave = newHighlights.filter(highlight => 
                          !existingHighlightIds.has(highlight.id.toString())
                        )
                        
                        if (highlightsToSave.length === 0) return
                        
                        // 배치 처리로 성능 향상
                        try {
                          await Promise.all(highlightsToSave.map(highlight => 
                            createHighlight({
                              contentId: contents[currentPage].content_id,
                              text: highlight.text,
                              color: highlight.color,
                              startOffset: highlight.startOffset,
                              endOffset: highlight.endOffset
                            })
                          ))
                          console.log('하이라이트 배치 저장 성공:', highlightsToSave.length)
                        } catch (error) {
                          console.error('하이라이트 저장 오류:', error)
                          alert('하이라이트 저장에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
                        }
                      }, 500) // 500ms 디바운싱
                      
                      return () => clearTimeout(timeoutId)
                    }}
                  >
                    <div className="space-y-4">
                      {contents[currentPage].content_type && (
                        <div className="text-sm font-medium text-blue-800 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">📋</span>
                            </div>
                            <span>{contents[currentPage].content_type}</span>
                          </div>
                        </div>
                      )}
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6" style={{ minHeight: '297mm', maxHeight: '297mm', overflowY: 'auto' }}>
                        {contents[currentPage].content_text_eng ? (
                          <div className="text-gray-800 prose prose-sm max-w-none">
                            <ReactMarkdown 
                              components={{
                                // 불필요한 컴포넌트 렌더링 방지
                                h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                                h2: ({children}) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                                h3: ({children}) => <h3 className="text-lg font-semibold mb-2">{children}</h3>,
                                p: ({children}) => <p className="mb-4 leading-relaxed">{children}</p>,
                                ul: ({children}) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
                                li: ({children}) => <li className="mb-1">{children}</li>,
                                strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                em: ({children}) => <em className="italic">{children}</em>,
                                code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                                pre: ({children}) => <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                                blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic mb-4">{children}</blockquote>,
                              }}
                            >
                              {contents[currentPage].content_text_eng}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-gray-500 text-2xl">🌐</span>
                              </div>
                              <div className="text-gray-500 font-medium">번역이 없습니다</div>
                              <div className="text-gray-400 text-sm mt-1">번역하기 버튼을 눌러주세요</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Highlighter>
                </div>
              </>
            ) : (
              <div className="text-gray-500">문서 내용이 없습니다.</div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col space-y-6">
            {paper && <PaperInfo paper={paper} showAbstract={true} />}
            {paper?.paper_url && (
              <div className="flex-1 min-h-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📄</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">문서 PDF</h3>
                </div>
                <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <PdfViewer 
                    filePath={paper.paper_url} 
                    title={paper.paper_title}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

export default PaperContent 