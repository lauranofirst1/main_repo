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
    
    // API 키 형식 검증
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('❌ OpenAI API 키가 설정되지 않았습니다.')
      return NextResponse.json({ error: 'OpenAI API 키가 설정되지 않았습니다.' }, { status: 500 })
    }
    
    // API 키 형식 확인
    if (!apiKey.startsWith('sk-')) {
      console.error('❌ 잘못된 API 키 형식:', apiKey.substring(0, 20) + '...')
      console.error('❌ 올바른 형식: sk-로 시작해야 합니다')
      console.error('❌ 현재 형식:', apiKey.startsWith('sk-proj-') ? '프로젝트 키 (sk-proj-)' : '알 수 없는 형식')
      return NextResponse.json({ 
        error: '잘못된 OpenAI API 키 형식입니다. 개인 API 키(sk-로 시작)를 사용해주세요.' 
      }, { status: 500 })
    }
    
    console.log('✅ API 키 형식 확인 완료:', apiKey.substring(0, 10) + '...')
    
    console.log('문서 정리노트 생성 시작:', paperId)

    if (!paperId) {
      return NextResponse.json(
        { error: 'paperId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 1. Supabase에서 해당 문서의 모든 문단 가져오기
    const { data: contents, error: contentsError } = await supabase
      .from('paper_contents')
      .select('*')
      .eq('content_paper_id', parseInt(paperId))
      .order('content_index', { ascending: true })

    if (contentsError) {
      console.error('Supabase 문단 조회 오류:', contentsError)
      return NextResponse.json(
        { error: '문단을 가져올 수 없습니다.' },
        { status: 500 }
      )
    }

    if (!contents || contents.length === 0) {
      console.log('Supabase에 문단이 없습니다.')
      return NextResponse.json(
        { error: '정리할 문단이 없습니다.' },
        { status: 400 }
      )
    }

    console.log(`총 ${contents.length}개의 문단을 처리합니다.`)

    // 2. 기존 요약이 있는지 확인하고 삭제
    const { error: deleteSummaryError } = await supabase
      .from('paper_summaries')
      .delete()
      .eq('summary_content_id', contents[0].content_id)

    if (deleteSummaryError) {
      console.error('기존 요약 삭제 오류:', deleteSummaryError)
      return NextResponse.json(
        { error: '기존 요약을 삭제할 수 없습니다.' },
        { status: 500 }
      )
    }

    // 3. 전체 문서를 한번에 처리하여 구조화된 정리노트 생성
    console.log(`전체 ${contents.length}개 페이지를 한번에 처리하여 정리노트 생성`)
    
    const allContentText = contents.map((content: any, idx: number) => 
      `## 페이지 ${idx + 1} (${content.content_type || '내용'})\n${content.content_text}`
    ).join('\n\n')

    const summaryPrompt = `
      다음은 학습 자료의 전체 내용입니다. 페이지별로 구성되어 있으며, 학습 자료의 전체적인 흐름과 구조를 파악하여 매우 상세하고 체계적인 정리노트를 작성해주세요.

# 📚 학습 자료 전체 내용

${allContentText}

위 학습 자료의 전체 내용을 바탕으로 다음 형식의 매우 상세한 정리노트를 작성해주세요:

# 📖 자세한 정리노트

## 🎯 학습 자료 개요
- **제목**: 학습 자료의 제목과 핵심 주제
- **학습 목적**: 이 자료가 다루는 주요 학습 목표
- **핵심 내용**: 이 자료의 가장 중요한 내용과 기여사항
- **학습 난이도**: 초급/중급/고급 수준 구분
- **예상 학습 시간**: 전체 내용을 이해하는데 필요한 시간

## 📋 상세한 내용 구조 분석
### 1️⃣ 도입부 및 배경 지식
- **학습 주제의 배경**: 왜 이 주제를 학습해야 하는지
- **사전 지식 요구사항**: 이 내용을 이해하기 위해 필요한 기초 지식
- **관련 개념들**: 이 주제와 연관된 다른 개념들
- **학습의 필요성**: 실제 적용 가능성과 중요성

### 2️⃣ 핵심 개념 및 원리
- **주요 개념 정의**: 핵심 용어들의 정확한 정의와 설명
- **작동 원리**: 시스템이나 방법의 기본 작동 원리
- **구성 요소**: 전체 시스템의 주요 구성 요소들
- **상호 관계**: 각 요소들 간의 관계와 연결성

### 3️⃣ 상세한 방법론 및 과정
- **단계별 과정**: 전체 과정을 단계별로 상세히 설명
- **구체적인 방법**: 실제 적용 가능한 구체적인 방법들
- **사용된 도구나 기술**: 언급된 도구, 기술, 소프트웨어 등
- **실행 조건**: 방법을 적용하기 위한 조건과 요구사항

### 4️⃣ 실제 사례 및 예시
- **구체적인 예시**: 실제 적용 사례나 예시들
- **단계별 설명**: 각 단계에서 어떤 일이 일어나는지
- **결과 해석**: 예시의 결과가 무엇을 의미하는지
- **실무 적용**: 실제 업무나 연구에서 어떻게 활용되는지

### 5️⃣ 결과 및 성과 분석
- **주요 결과**: 가장 중요한 발견사항이나 결과
- **성과 지표**: 측정 가능한 성과나 개선사항
- **비교 분석**: 다른 방법들과의 비교
- **한계점**: 현재 방법의 한계나 부족한 점

### 6️⃣ 실무 적용 및 활용 방안
- **산업계 적용**: 실제 산업에서의 활용 가능성
- **상용화 방안**: 제품이나 서비스로 개발 가능성
- **확장 가능성**: 다른 분야로의 확장 적용
- **미래 전망**: 향후 발전 방향과 가능성

## 💡 핵심 개념 상세 정리
### 주요 용어 사전
- **정의**: 각 핵심 용어의 정확한 정의
- **설명**: 용어의 의미와 중요성
- **예시**: 용어를 이해하기 위한 구체적인 예시
- **관련 용어**: 연관된 다른 용어들과의 관계

### 핵심 아이디어 정리
- **핵심 메시지**: 가장 중요한 핵심 메시지
- **이해 포인트**: 반드시 이해해야 할 핵심 포인트
- **실무 적용점**: 실제로 어떻게 활용할 수 있는지
- **기억해야 할 점**: 장기적으로 기억해야 할 중요 내용

## 🔬 기술적 세부사항 및 구현 방법
### 시스템 아키텍처
- **전체 구조**: 시스템의 전체적인 구조와 설계
- **구성 요소**: 각 구성 요소의 역할과 기능
- **데이터 흐름**: 데이터가 어떻게 처리되고 흐르는지
- **인터페이스**: 시스템 간의 연결과 통신 방법

### 구현 방법 및 알고리즘
- **구현 단계**: 실제 구현을 위한 단계별 가이드
- **핵심 알고리즘**: 사용된 주요 알고리즘의 설명
- **최적화 기법**: 성능 향상을 위한 최적화 방법
- **코드 예시**: 실제 구현을 위한 코드나 의사코드

### 성능 및 품질 관리
- **성능 지표**: 측정 가능한 성능 지표들
- **품질 기준**: 품질을 평가하는 기준과 방법
- **테스트 방법**: 검증을 위한 테스트 방법
- **모니터링**: 지속적인 모니터링 방법

## 📊 심화 분석 및 해석
### 결과의 의미와 해석
- **통계적 의미**: 통계적 결과의 의미와 해석
- **실무적 의미**: 실제 업무에서의 의미
- **학술적 의미**: 학술적 관점에서의 의미
- **사회적 영향**: 사회나 산업에 미치는 영향

### 비교 분석 및 평가
- **기존 방법과의 비교**: 기존 방법들과의 차이점
- **장단점 분석**: 현재 방법의 장점과 단점
- **경쟁력 분석**: 시장에서의 경쟁력과 차별화 요소
- **개선 가능성**: 향후 개선할 수 있는 부분들

## 🚀 실무 적용 가이드
### 실제 적용 사례
- **산업별 적용**: 각 산업에서의 구체적인 적용 사례
- **기업 사례**: 실제 기업들의 적용 사례
- **성공 사례**: 성공적으로 적용된 사례들
- **실패 사례**: 실패 사례와 그 원인 분석

### 구현 가이드라인
- **구현 단계**: 실제 구현을 위한 상세한 단계
- **필요 자원**: 구현에 필요한 인력, 예산, 시간
- **리스크 관리**: 구현 과정에서 발생할 수 있는 리스크
- **성공 요인**: 성공적인 구현을 위한 핵심 요인

## 📚 추가 학습 자료 및 참고사항
### 관련 연구 및 자료
- **관련 논문**: 이 주제와 관련된 주요 논문들
- **참고 서적**: 추가 학습을 위한 도서 목록
- **온라인 자료**: 유용한 온라인 자료들
- **커뮤니티**: 관련 커뮤니티나 포럼

### 확장 학습 주제
- **심화 학습**: 더 깊이 있게 학습할 수 있는 주제들
- **관련 분야**: 연관된 다른 분야나 주제들
- **최신 동향**: 해당 분야의 최신 연구 동향
- **미래 연구**: 향후 연구 가능한 주제들

## 🎯 학습 체크리스트
### 이해도 확인
- [ ] 핵심 개념들을 정확히 이해했는가?
- [ ] 주요 방법론의 단계를 설명할 수 있는가?
- [ ] 실제 적용 사례를 구체적으로 설명할 수 있는가?
- [ ] 장단점을 비교 분석할 수 있는가?

### 실무 적용 준비
- [ ] 실제 프로젝트에 적용할 수 있는가?
- [ ] 필요한 도구와 기술을 파악했는가?
- [ ] 예상되는 문제점과 해결방안을 생각해볼 수 있는가?
- [ ] 팀원들에게 이 내용을 설명할 수 있는가?

각 섹션은 학습 자료의 내용을 최대한 상세하고 구체적으로 정리하고, 실제 학습과 실무 적용에 도움이 되도록 작성해주세요. 마크다운 형식을 적극 활용하여 가독성을 높이고, 이해하기 쉽게 구조화해주세요. 특히 구체적인 예시와 실제 적용 방안을 충분히 포함해주세요.
`

    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 학습 자료를 매우 상세하고 체계적으로 분석하고 정리하는 전문가입니다. 학습 자료의 전체적인 흐름을 파악하여 실제 학습과 실무 적용에 도움이 되는 매우 상세한 정리노트를 작성해주세요. 각 섹션이 논리적으로 연결되도록 하고, 핵심 내용을 명확하게 정리하며, 구체적인 예시와 실제 적용 방안을 충분히 포함해주세요.'
        },
        {
          role: 'user',
          content: summaryPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    })

    const summaryResult = summaryResponse.choices[0]?.message?.content
    if (!summaryResult) {
      throw new Error('OpenAI 요약 응답을 받지 못했습니다.')
    }

    const summaries = [{
      summary_content_id: contents[0].content_id,
      summary_text: summaryResult,
      summary_type: 'AI_전체정리노트'
    }]

    console.log('전체 정리노트 생성 완료')

    // 4. 요약을 Supabase에 저장
    if (summaries.length > 0) {
      const { data: insertedSummaries, error: insertSummaryError } = await supabase
        .from('paper_summaries')
        .insert(summaries)
        .select()

      if (insertSummaryError) {
        console.error('요약 저장 오류:', insertSummaryError)
        return NextResponse.json(
          { error: '요약을 저장할 수 없습니다.' },
          { status: 500 }
        )
      }

      console.log(`${insertedSummaries?.length || 0}개의 요약이 성공적으로 저장되었습니다.`)

      return NextResponse.json({
        success: true,
        summaryCount: insertedSummaries?.length || 0,
        message: '정리노트가 성공적으로 생성되었습니다.'
      })
    } else {
      return NextResponse.json({
        success: false,
        summaryCount: 0,
        message: '생성된 요약이 없습니다.'
      })
    }

  } catch (error) {
    console.error('정리노트 생성 중 오류:', error)
    return NextResponse.json(
      { error: '정리노트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 