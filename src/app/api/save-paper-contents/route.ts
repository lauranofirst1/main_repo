import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { paperId } = await request.json()

    if (!paperId) {
      return NextResponse.json(
        { error: 'paperId가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('문서 문단 저장 시작:', paperId)

    // 1. 외부 API에서 해당 문서의 모든 문단 가져오기
    const apiUrl = process.env.NEXT_PUBLIC_PDF_API_URL || 'http://localhost:8000'
    console.log(`외부 API 호출: ${apiUrl}/papers/${paperId}/contents`)
    
    const response = await fetch(`${apiUrl}/papers/${paperId}/contents`)

    if (!response.ok) {
      return NextResponse.json(
        { error: '외부 API에서 문단을 가져올 수 없습니다.' },
        { status: 500 }
      )
    }

    const result = await response.json()
    console.log(`외부 API 응답: contents_count = ${result.contents_count}`)
    
    const contents = result.contents || []

    if (contents.length === 0) {
      console.log('저장할 문단이 없습니다.')
      return NextResponse.json(
        { error: '저장할 문단이 없습니다.' },
        { status: 400 }
      )
    }

    console.log(`총 ${contents.length}개의 문단을 Supabase에 저장합니다.`)

    // 2. 기존 문단이 있으면 삭제 (해당 paper_id만)
    const { error: deleteError } = await supabase
      .from('paper_contents')
      .delete()
      .eq('content_paper_id', parseInt(paperId))

    if (deleteError) {
      console.error('기존 문단 삭제 오류:', deleteError)
      return NextResponse.json(
        { error: '기존 문단을 삭제할 수 없습니다.' },
        { status: 500 }
      )
    }

    // 3. 새로운 문단들을 Supabase에 저장
    const contentsToInsert = contents.map((content: any, idx: number) => ({
      content_paper_id: parseInt(paperId),
      content_type: 'paragraph', // 기본적으로 paragraph로 저장
      content_index: idx + 1,
      content_text: content.text || content.content_text || content
    }))

    const { data: insertedContents, error: insertError } = await supabase
      .from('paper_contents')
      .insert(contentsToInsert)
      .select()

    if (insertError) {
      console.error('문단 저장 오류:', insertError)
      return NextResponse.json(
        { error: '문단을 저장할 수 없습니다.' },
        { status: 500 }
      )
    }

    console.log(`${insertedContents?.length || 0}개의 문단이 성공적으로 저장되었습니다.`)

    return NextResponse.json({
      success: true,
      savedCount: insertedContents?.length || 0,
      message: '문단이 성공적으로 저장되었습니다.'
    })

  } catch (error) {
    console.error('문단 저장 중 오류:', error)
    return NextResponse.json(
      { error: '문단 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 