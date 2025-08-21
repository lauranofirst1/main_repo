'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

// PDF.js 스타일 import
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// 텍스트 레이어 숨기기 스타일
const textLayerStyles = `
  .react-pdf__Page__textContent {
    display: none !important;
  }
  .react-pdf__Page__annotations {
    display: none !important;
  }
`

// PDF.js 워커 설정 - 로컬 파일 사용
// SSR 문제를 피하기 위해 useEffect에서 설정
let pdfjs: any = null

interface PdfViewerProps {
  filePath: string
  title?: string
}

export default function PdfViewer({ filePath, title }: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [Document, setDocument] = useState<any>(null)
  const [Page, setPage] = useState<any>(null)

  // PDF.js 옵션을 메모이제이션하여 불필요한 리로드 방지
  const pdfOptions = useMemo(() => ({
    cMapUrl: '/cmaps/',
    cMapPacked: true,
  }), [])

  // PDF.js 초기화
  useEffect(() => {
    const initPdf = async () => {
      try {
        const { Document: Doc, Page: PageComp, pdfjs } = await import('react-pdf')
        
        // PDF.js 워커 설정
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
        
        setDocument(() => Doc)
        setPage(() => PageComp)
      } catch (err) {
        console.error('PDF.js 초기화 오류:', err)
        setError('PDF 뷰어를 초기화할 수 없습니다.')
      }
    }

    initPdf()
  }, [])

  // PDF URL 생성
  const getPdfUrl = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      // Supabase Storage에서 PDF URL 생성
      const { data, error } = await supabase.storage
        .from('papers')
        .createSignedUrl(filePath, 3600) // 1시간 유효

      if (error) {
        console.error('PDF URL 생성 오류:', error)
        setError('PDF 파일을 불러올 수 없습니다.')
        return
      }

      setPdfUrl(data.signedUrl)
    } catch (err) {
      console.error('PDF URL 생성 중 오류:', err)
      setError('PDF 파일을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [filePath])

  useEffect(() => {
    if (filePath) {
      getPdfUrl()
    }
  }, [filePath, getPdfUrl])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF 로드 오류:', error)
    setError('PDF 파일을 로드할 수 없습니다.')
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset
      return Math.min(Math.max(1, newPageNumber), numPages)
    })
  }

  const changeScale = (newScale: number) => {
    setScale(Math.min(Math.max(0.5, newScale), 2.0))
  }

  if (loading) {
    return (
      <div className="h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500 text-sm">PDF 로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div className="font-semibold mb-2 text-sm">PDF 로드 오류</div>
          <div className="text-xs">{error}</div>
        </div>
      </div>
    )
  }

  if (!Document || !Page) {
    return (
      <div className="h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500 text-sm">PDF 뷰어 초기화 중...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
      <style dangerouslySetInnerHTML={{ __html: textLayerStyles }} />
      {/* 컨트롤 */}
      {numPages > 0 && (
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-gray-50 border-b border-gray-200">
          {/* 페이지 네비게이션 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              이전
            </button>
            <span className="text-xs text-gray-600">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => changePage(1)}
              disabled={pageNumber >= numPages}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              다음
            </button>
          </div>

          {/* 확대/축소 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeScale(scale - 0.1)}
              disabled={scale <= 0.5}
              className="px-2 py-1 bg-gray-500 text-white rounded text-xs disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              -
            </button>
            <span className="text-xs text-gray-600 w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => changeScale(scale + 0.1)}
              disabled={scale >= 2.0}
              className="px-2 py-1 bg-gray-500 text-white rounded text-xs disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              +
            </button>
          </div>
        </div>
      )}
      
      {/* PDF 뷰어 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-center min-w-max">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            options={pdfOptions}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={true}
              className="max-w-full h-auto"
            />
          </Document>
        </div>
      </div>
    </div>
  )
} 