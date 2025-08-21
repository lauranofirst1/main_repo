'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { CloudArrowUpIcon, DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { extractParagraphsFromPaper } from '@/lib/pdfApi'

interface PdfUploadModalProps {
  topicId: string
  isOpen: boolean
  onClose: () => void
  onUploadSuccess?: (filePath: string, originalFileName: string) => void
  onUploadError?: (error: string) => void
}

export default function PdfUploadModal({
  topicId,
  isOpen,
  onClose,
  onUploadSuccess,
  onUploadError,
}: PdfUploadModalProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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
    const lastDotIndex = originalName.lastIndexOf('.')
    const extension = lastDotIndex > 0 ? originalName.slice(lastDotIndex).toLowerCase() : '.pdf'
    const nameWithoutExt = lastDotIndex > 0 ? originalName.slice(0, lastDotIndex) : originalName

    const safeName = nameWithoutExt
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase()
      .substring(0, 50)

    const finalName = safeName || 'document'
    return `${finalName}${extension}`
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    if (!user) {
      onUploadError?.('로그인이 필요합니다.')
      return
    }
    if (selectedFile.type !== 'application/pdf') {
      onUploadError?.('PDF 파일만 업로드 가능합니다.')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      onUploadError?.('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    let paperId: number | null = null

    try {
      // 세션 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('인증 세션이 없습니다.')

      // 주제 소유권 확인
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('topic_user_id')
        .eq('topic_id', topicId)
        .single()
      if (topicError) throw new Error('주제 정보를 찾을 수 없습니다.')
      if (topicData.topic_user_id !== session.user.id) {
        throw new Error('이 주제에 문서를 추가할 권한이 없습니다.')
      }

      // 파일명 생성
      const timestamp = Date.now()
      const safeName = generateSafeFileName(selectedFile.name)
      const fileName = `${timestamp}_${safeName}`
      const filePath = `${topicId}/${fileName}`

      // 1. Storage 업로드
      const { error: storageError } = await supabase.storage
        .from('papers')
        .upload(filePath, selectedFile)
      if (storageError) throw storageError
      setUploadProgress(40)

      // 2. paper 테이블 삽입
      const { data: paperData, error: paperError } = await supabase
        .from('paper')
        .insert({
          paper_topic_id: parseInt(topicId),
          paper_title: selectedFile.name.replace('.pdf', ''),
          paper_abstract: description || null,
          paper_url: filePath,
          paper_created_at: new Date().toISOString(),
        })
        .select()
      if (paperError) throw paperError

      paperId = paperData![0].paper_id
      setUploadProgress(60)

      // 3. PDF 텍스트 추출
      setExtractingText(true)
      await extractParagraphsFromPaper(paperId!.toString())
      setExtractingText(false)
      setUploadProgress(100)

      // 성공 시만 목록 갱신
      onUploadSuccess?.(filePath, selectedFile.name)
      onClose()
    } catch (error) {
      console.error('PDF 업로드 오류:', error)

      // 추출 실패 시 DB에서 삽입된 레코드 삭제
      if (paperId) {
        await supabase
          .from('paper')
          .delete()
          .eq('paper_id', paperId)
      }

      onUploadError?.(
        error instanceof Error
          ? error.message
          : '업로드 중 오류가 발생했습니다.'
      )
    } finally {
      setIsUploading(false)
      setExtractingText(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleButtonClick = () => fileInputRef.current?.click()
  const handleClose = () => {
    setSelectedFile(null)
    setDescription('')
    setDragActive(false)
    setUploadProgress(0)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">문서 업로드</h2>
          <button onClick={handleClose} disabled={isUploading}>
            <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {apiStatus === 'checking' && (
            <div className="p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
              PDF API 서버 상태 확인 중...
            </div>
          )}
          {apiStatus === 'offline' && (
            <div className="p-2 bg-red-100 text-red-800 rounded text-sm">
              ⚠️ PDF API 서버에 연결할 수 없습니다. PDF 텍스트 추출 기능이 제한됩니다.
            </div>
          )}
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
                  <p className="text-sm text-gray-600">
                    {extractingText ? 'PDF에서 문단 추출 중...' : '업로드 중...'}
                  </p>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : selectedFile ? (
                <div className="space-y-2">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-green-500" />
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button onClick={() => setSelectedFile(null)} className="text-sm text-red-600 hover:text-red-700">
                    파일 제거
                  </button>
                </div>
              ) : (
                <>
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span onClick={handleButtonClick} className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                        클릭하여 파일 선택
                      </span>{' '}
                      또는 드래그 앤 드롭
                    </p>
                    <p className="text-xs text-gray-500">PDF 파일만 지원 (최대 10MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                              문서 설명 (선택사항)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
                              placeholder="문서에 대한 간단한 설명을 입력하세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              disabled={isUploading}
            />
          </div>

          {selectedFile && !isUploading && (
            <button
              onClick={handleFileUpload}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={apiStatus === 'offline'}
            >
              <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                              문서 업로드
            </button>
          )}

          {!selectedFile && !isUploading && (
            <button
              onClick={handleButtonClick}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={apiStatus === 'offline'}
            >
              <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
              PDF 파일 선택
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
