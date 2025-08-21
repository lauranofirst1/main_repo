import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    console.log('PDF 처리 API 호출됨')
    
    // JSON 요청 본문에서 paper_id 추출
    const { paperId } = await request.json()
    
    if (!paperId) {
      console.error('paperId가 요청에 없음')
      return NextResponse.json(
        { error: 'paperId가 필요합니다.' },
        { status: 400 }
      )
    }
    
    console.log('처리할 문서 ID:', paperId)
    
    // 1. 문서 정보 조회 (PDF URL 가져오기)
    const { data: paperData, error: paperError } = await supabase
      .from('paper')
      .select('paper_id, paper_title, paper_url')
      .eq('paper_id', paperId)
      .single()
    
    if (paperError || !paperData) {
              console.error('문서 정보 조회 실패:', paperError)
      return NextResponse.json(
                  { error: '문서 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    if (!paperData.paper_url) {
              console.error('문서에 PDF URL이 없음')
      return NextResponse.json(
                  { error: '문서에 PDF 파일이 없습니다.' },
        { status: 400 }
      )
    }
    
          console.log('문서 정보:', {
      id: paperData.paper_id,
      title: paperData.paper_title,
      url: paperData.paper_url
    })
    
    // 2. 외부 PDF API 호출 (paper_id만 전달)
    const apiUrl = process.env.NEXT_PUBLIC_PDF_API_URL || 'http://localhost:8000'
    console.log('외부 API URL:', `${apiUrl}/process-paper`)
    
    const response = await fetch(`${apiUrl}/process-paper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paper_id: parseInt(paperId)
      }),
    })

    console.log('외부 API 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('외부 PDF API 오류:', response.status, errorText)
      return NextResponse.json(
        { error: `PDF API 호출 실패: ${response.status} ${response.statusText} - ${errorText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('외부 API 응답 성공:', result)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('PDF 처리 오류:', error)
    return NextResponse.json(
      { error: `PDF 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    )
  }
} 