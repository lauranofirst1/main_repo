import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import OpenAI from 'openai'

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { paperId } = await request.json()

    if (!paperId) {
      return NextResponse.json(
        { error: 'paperId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 학습 자료의 모든 문단 가져오기
    const { data: contents, error: fetchError } = await supabase
      .from('paper_contents')
      .select('content_id, content_text')
      .eq('content_paper_id', parseInt(paperId))
      .order('content_index', { ascending: true })

    if (fetchError) {
      return NextResponse.json({ error: '문단을 가져올 수 없습니다.' }, { status: 500 })
    }

    if (!contents || contents.length === 0) {
      return NextResponse.json({ error: '문단이 없습니다.' }, { status: 400 })
    }

    // 기존 번역 삭제
    console.log('기존 번역 삭제 중...')
    const { error: deleteError } = await supabase
      .from('paper_contents')
      .update({ content_text_eng: null })
      .eq('content_paper_id', parseInt(paperId))

    if (deleteError) {
      console.error('기존 번역 삭제 오류:', deleteError)
      return NextResponse.json({ error: '기존 번역을 삭제할 수 없습니다.' }, { status: 500 })
    }

    console.log('기존 번역 삭제 완료, 새로운 번역 생성 시작')

    // 각 문단별로 번역 생성
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      
      // 불필요한 내용 필터링
      let filteredText = content.content_text;
      
      // 저작권, 페이지 번호, 그림 참조 등 제거
      filteredText = filteredText
        .replace(/©\s*\d{4}.*?\./gi, '') // 저작권 표시 제거
        .replace(/Page\s+\d+/gi, '') // 페이지 번호 제거
        .replace(/Figure\s+\d+/gi, '') // 그림 참조 제거
        .replace(/Table\s+\d+/gi, '') // 표 참조 제거
        .replace(/\[.*?\]/g, '') // 대괄호 내용 제거
        .replace(/\(.*?\)/g, '') // 괄호 내용 제거 (단, 중요한 용어는 유지)
        .replace(/^\s*[\d\.]+\s*$/gm, '') // 숫자만 있는 줄 제거
        .replace(/^\s*[A-Z][A-Z\s]+\s*$/gm, '') // 대문자만 있는 줄 제거
        .replace(/\n\s*\n\s*\n/g, '\n\n') // 연속된 빈 줄 정리
        .trim();
      
      // 필터링 후 내용이 너무 짧으면 건너뛰기
      if (filteredText.length < 50) {
        console.log(`문단 ${i + 1}: 내용이 너무 짧아 건너뜀 (${filteredText.length}자)`)
        continue;
      }
      
      try {
        // OpenAI API 호출
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `당신은 인공지능 및 IT, 과학 기술 분야의 학습 자료 번역을 전문으로 하는 전문 번역가입니다. 

번역 규칙:
1. 맥락의 정확성: 학습 자료의 전체적인 맥락을 파악하여 자연스럽게 번역
2. 주요 용어 원문 병기: 핵심 학술 용어는 "한국어 (영어)" 형식으로 병기
3. 번역의 완전성: 모든 내용을 충실하게 번역
4. 용어의 일관성: 동일한 용어는 일관되게 번역
5. 전문적 문체: 학술 자료에 적합한 전문적이고 간결한 문체 사용

마크다운 형식 처리:
- 제목이나 섹션 제목은 "## 제목" 형식으로 변환
- 부제목은 "### 부제목" 형식으로 변환
- 번호가 매겨진 목록은 "1. 내용" 형식 유지
- 글머리 기호 목록은 "- 내용" 형식 유지

불필요한 내용 제거:
- 저작권 표시, 페이지 번호, 그림/표 참조는 제거
- 반복되는 지침이나 메타데이터는 제거
- 학습 자료의 실제 내용만 번역`
            },
            {
              role: "user",
              content: `다음 영어 학습 자료 내용을 한국어로 번역하고 마크다운 형식으로 정리해주세요. 불필요한 내용은 제거하고 학습 자료의 실제 내용만 번역해주세요:\n\n${filteredText}`
            }
          ],
          max_tokens: 1500,
          temperature: 0.1,
        })

        const translation = completion.choices[0]?.message?.content || '번역을 생성할 수 없습니다.'

        // 번역을 데이터베이스에 저장
        await supabase
          .from('paper_contents')
          .update({ content_text_eng: translation })
          .eq('content_id', content.content_id)

      } catch (openaiError) {
        console.error(`문단 ${i + 1} 번역 생성 오류:`, openaiError)
        
        // OpenAI API 오류 시 기본 번역 생성
        const fallbackTranslation = `번역 오류: 이 문단의 번역을 생성할 수 없습니다. 원문을 참고해주세요.`

        await supabase
          .from('paper_contents')
          .update({ content_text_eng: fallbackTranslation })
          .eq('content_id', content.content_id)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${contents.length}개 문단 번역 완료` 
    })
  } catch (error) {
    console.error('번역 생성 오류:', error)
    return NextResponse.json({ 
      error: '번역 중 오류 발생' 
    }, { status: 500 })
  }
} 