import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 토픽 최근 본 목록 가져오기
    const { data: topicViews, error: topicError } = await supabase
      .from('topic_recent_views')
      .select(`
        view_topic_id,
        view_last_viewed_at,
        topics!inner(
          topic_id,
          topic_name,
          topic_description,
          topic_created_at
        )
      `)
      .eq('view_user_id', userId)
      .order('view_last_viewed_at', { ascending: false })
      .limit(3)

    if (topicError) {
      console.error('토픽 최근 본 목록 조회 오류:', topicError)
      return NextResponse.json(
        { error: '토픽 최근 본 목록을 가져올 수 없습니다.' },
        { status: 500 }
      )
    }

    // 문서 최근 본 목록 가져오기
    const { data: paperViews, error: paperError } = await supabase
      .from('paper_recent_views')
      .select(`
        view_paper_id,
        view_last_viewed_at,
        paper!inner(
          paper_id,
          paper_title,
          paper_abstract,
          paper_topic_id
        )
      `)
      .eq('view_user_id', userId)
      .order('view_last_viewed_at', { ascending: false })
      .limit(3)

    if (paperError) {
              console.error('문서 최근 본 목록 조회 오류:', paperError)
      return NextResponse.json(
                  { error: '문서 최근 본 목록을 가져올 수 없습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      topicViews: topicViews || [],
      paperViews: paperViews || []
    })
  } catch (error) {
    console.error('최근 본 목록 조회 중 오류:', error)
    return NextResponse.json({ 
      error: '최근 본 목록 조회 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
} 