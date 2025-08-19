// PDF API와의 통신을 위한 유틸리티 함수들

export interface PaperContent {
  content_id?: number
  content_paper_id?: number
  content_type?: string
  content_index: number
  content_text: string
}

export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

// 학습 자료 ID를 사용하여 PDF에서 문단 추출
export async function extractParagraphsFromPaper(paperId: string): Promise<void> {
  try {
    const response = await fetch('/api/process-paper', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paperId: paperId
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('PDF 텍스트 추출 완료:', result)
  } catch (error) {
    console.error('PDF 텍스트 추출 API 오류:', error)
    throw new Error(`PDF 텍스트 추출에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

// 특정 학습 자료의 모든 문단 조회
export async function getPaperContents(paperId: string): Promise<PaperContent[]> {
  try {
    const response = await fetch(`/api/papers/${paperId}/contents`)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    
    // 외부 API 응답 형식에 맞게 처리
    if (result.contents && Array.isArray(result.contents)) {
      return result.contents.map((content: any) => ({
        content_id: content.content_id,
        content_paper_id: content.content_paper_id,
        content_type: content.content_type,
        content_index: content.content_index,
        content_text: content.content_text
      }))
    } else if (Array.isArray(result)) {
      return result.map((content: any) => ({
        content_id: content.content_id,
        content_paper_id: content.content_paper_id,
        content_type: content.content_type,
        content_index: content.content_index,
        content_text: content.content_text
      }))
    } else {
      console.warn('예상하지 못한 API 응답 형식:', result)
      return []
    }
  } catch (error) {
    console.error('학습 자료 콘텐츠 조회 API 오류:', error)
    throw new Error(`학습 자료 콘텐츠 조회에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

// 특정 콘텐츠 조회 (Next.js API 라우트 사용)
export async function getPaperContent(paperId: string, contentId: string): Promise<PaperContent> {
  try {
    const response = await fetch(`/api/papers/${paperId}/contents/${contentId}`)
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    return result.content || result.data
  } catch (error) {
    console.error('콘텐츠 조회 오류:', error)
    throw new Error(`콘텐츠 조회에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

// 학습 자료 콘텐츠 삭제 (Next.js API 라우트 사용)
export async function deletePaperContents(paperId: string): Promise<void> {
  try {
    const response = await fetch(`/api/papers/${paperId}/contents`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error('학습 자료 콘텐츠 삭제 오류:', error)
    throw new Error(`학습 자료 콘텐츠 삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

// API 상태 확인 (Next.js API 라우트 사용)
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health')
    return response.ok
  } catch (error) {
    console.error('API 상태 확인 오류:', error)
    return false
  }
} 