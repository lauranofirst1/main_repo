'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { CloudArrowUpIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { extractParagraphsFromPaper } from '@/lib/pdfApi'

interface PdfUploadProps {
  topicId: string
  onUploadSuccess?: (filePath: string, originalFileName: string) => void
  onUploadError?: (error: string) => void
}

export default function PdfUpload({ topicId, onUploadSuccess, onUploadError }: PdfUploadProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [extractingText, setExtractingText] = useState(false)
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // API 상태 확인
  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch('/api/health')
        setApiStatus(response.ok ? 'online' : 'offline')
      } catch (error) {
        console.error('API 상태 확인 실패:', error)
        setApiStatus('offline')
      }
    }

    checkApi()
  }, [])

  // 안전한 파일명 생성 함수
  const generateSafeFileName = (originalName: string): string => {
    // 파일 확장자 추출
    const lastDotIndex = originalName.lastIndexOf('.')
    const extension = lastDotIndex > 0 ? originalName.slice(lastDotIndex).toLowerCase() : '.pdf'
    const nameWithoutExt = lastDotIndex > 0 ? originalName.slice(0, lastDotIndex) : originalName
    
    // 안전한 파일명 생성 (더 엄격한 규칙)
    const safeName = nameWithoutExt
      .replace(/[^a-zA-Z0-9]/g, '_') // 영문, 숫자만 허용 (한글 제거)
      .replace(/_{2,}/g, '_') // 연속된 언더스코어를 하나로
      .replace(/^_|_$/g, '') // 앞뒤 언더스코어 제거
      .toLowerCase() // 소문자로 변환
      .substring(0, 50) // 최대 50자로 제한
    
    // 파일명이 비어있으면 기본값 사용
    const finalName = safeName || 'document'
    
    return `${finalName}${extension}`
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // 인증 상태 확인
    if (!user) {
      onUploadError?.('로그인이 필요합니다.')
      return
    }

    // PDF 파일 검증
    if (file.type !== 'application/pdf') {
      onUploadError?.('PDF 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 검증 (20MB 제한)
    if (file.size > 20 * 1024 * 1024) {
      onUploadError?.('파일 크기는 20MB 이하여야 합니다.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 현재 세션 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('인증 세션이 없습니다.')
      }

      console.log('현재 사용자:', session.user.email)
      console.log('사용자 ID:', session.user.id)
      console.log('원본 파일명:', file.name)
      console.log('파일 크기:', file.size)
      console.log('파일 타입:', file.type)

      // 사용자가 해당 주제의 소유자인지 확인
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('topic_id, topic_user_id')
        .eq('topic_id', topicId)
        .single()

      if (topicError) {
        console.error('주제 조회 오류:', topicError)
        throw new Error('주제 정보를 찾을 수 없습니다.')
      }

      console.log('주제 정보:', topicData)
      console.log('주제 소유자 ID:', topicData.topic_user_id)
      console.log('현재 사용자 ID:', session.user.id)

      if (topicData.topic_user_id !== session.user.id) {
        throw new Error('이 주제에 문서를 추가할 권한이 없습니다.')
      }

      // 안전한 파일명 생성
      const timestamp = Date.now()
      const safeFileName = generateSafeFileName(file.name)
      const fileName = `${timestamp}_${safeFileName}`
      const filePath = `${topicId}/${fileName}`

      console.log('안전한 파일명:', safeFileName)
      console.log('최종 파일명:', fileName)
      console.log('업로드 경로:', filePath)

      // 1. Supabase Storage에 파일 업로드
      const { data, error } = await supabase.storage
        .from('papers')
        .upload(filePath, file)

      if (error) {
        console.error('Storage 업로드 오류:', error)
        console.error('오류 메시지:', error.message)
        throw error
      }

      console.log('Storage 업로드 성공:', data)
      setUploadProgress(40)

      // 2. paper 테이블에 레코드 생성
      const { data: paperData, error: paperError } = await supabase
        .from('paper')
        .insert({
          paper_topic_id: parseInt(topicId),
          paper_title: file.name.replace('.pdf', ''),
          paper_url: filePath, // Storage 경로 저장
          paper_created_at: new Date().toISOString()
        })
        .select()

      if (paperError) {
        console.error('Paper 테이블 생성 오류:', paperError)
        throw new Error('문서 정보 저장에 실패했습니다.')
      }

              console.log('문서 저장 성공:', paperData)
      setUploadProgress(60)

      // 3. 외부 API를 사용하여 PDF 텍스트 추출
      const paperId = paperData[0].paper_id
      setExtractingText(true)
      console.log('PDF에서 문단 추출 중...')
      
      await extractParagraphsFromPaper(paperId.toString())
      console.log('PDF 텍스트 추출 완료')
      setExtractingText(false)
      setUploadProgress(100)

      onUploadSuccess?.(filePath, file.name)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('PDF 업로드 오류:', error)
      onUploadError?.(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
      setExtractingText(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* API 상태 표시 */}
      {apiStatus === 'checking' && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
          PDF API 서버 상태 확인 중...
        </div>
      )}
      {apiStatus === 'offline' && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded text-sm">
          ⚠️ PDF API 서버에 연결할 수 없습니다. PDF 텍스트 추출 기능이 제한됩니다.
        </div>
      )}
      

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="space-y-4">
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-600">
                {extractingText ? 'PDF에서 문단 추출 중...' : '업로드 중...'}
              </p>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <>
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer" onClick={handleButtonClick}>
                    클릭하여 파일 선택
                  </span>
                  {' '}또는 드래그 앤 드롭
                </p>
                <p className="text-xs text-gray-500">PDF 파일만 지원 (최대 10MB)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {!isUploading && (
        <button
          onClick={handleButtonClick}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          disabled={apiStatus === 'offline'}
        >
          <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
          PDF 파일 업로드
        </button>
      )}
    </div>
  )
} 