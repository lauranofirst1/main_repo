# StudyWithAI 시스템 개요

## 🎯 시스템 목적
AI를 활용한 논문 학습 및 퀴즈 생성 플랫폼으로, 사용자가 논문을 업로드하고 AI의 도움을 받아 효율적으로 학습할 수 있도록 지원합니다.

## 🏗️ 아키텍처 특징

### 1. **Full-Stack Next.js 아키텍처**
- **Frontend**: Next.js 13 App Router 기반의 React 애플리케이션
- **Backend**: Next.js API Routes를 통한 서버리스 백엔드
- **Database**: Supabase (PostgreSQL) 기반 데이터베이스
- **Authentication**: Supabase Auth를 통한 JWT 기반 인증

### 2. **AI 통합 아키텍처**
- **OpenAI GPT API**: 퀴즈 생성, 요약, 번역, 학습 분석
- **PDF Processing API**: 외부 PDF 텍스트 추출 서비스
- **실시간 처리**: AI 작업 진행률 실시간 표시

### 3. **모듈화된 컴포넌트 구조**
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── (pages)/        # 페이지 컴포넌트
│   └── layout.tsx      # 루트 레이아웃
├── components/         # 재사용 가능한 컴포넌트
│   ├── layout/         # 레이아웃 관련 컴포넌트
│   ├── learning/       # 학습 관련 컴포넌트
│   ├── pdf/           # PDF 관련 컴포넌트
│   └── ui/            # UI 컴포넌트
├── context/           # React Context
├── hooks/             # Custom Hooks
├── lib/               # 유틸리티 라이브러리
└── models/            # 데이터 모델 정의
```

## 🔄 주요 데이터 플로우

### 1. **논문 업로드 프로세스**
```
PDF 업로드 → 텍스트 추출 → 내용 저장 → AI 분석 준비
```

### 2. **학습 플로우**
```
논문 읽기 → AI 요약 → 퀴즈 생성 → 학습 분석 → 통계
```

### 3. **AI 작업 플로우**
```
사용자 요청 → API 호출 → OpenAI 처리 → 결과 저장 → UI 업데이트
```

## 🛠️ 핵심 기술 스택

### Frontend
- **Next.js 13**: 최신 App Router 사용
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Material-UI**: 추가 UI 컴포넌트
- **Zustand**: 경량 상태 관리
- **React Context**: 전역 상태 관리

### Backend & Database
- **Supabase**: PostgreSQL 기반 BaaS
- **Next.js API Routes**: 서버리스 API
- **Row Level Security**: 데이터 보안

### AI & External Services
- **OpenAI GPT**: 자연어 처리
- **PDF Processing API**: 문서 처리
- **Supabase Storage**: 파일 저장

## 📊 데이터 모델

### 핵심 엔티티
1. **Users**: 사용자 정보
2. **Topics**: 학습 주제
3. **Papers**: 논문 정보
4. **Paper Contents**: 논문 내용
5. **Paper Summaries**: AI 요약
6. **Paper Quizzes**: 생성된 퀴즈
7. **Learning Analyses**: 학습 분석

### 관계 구조
```
Users (1) → (N) Topics
Topics (1) → (N) Papers  
Papers (1) → (N) Paper Contents
Papers (1) → (N) Paper Summaries
Papers (1) → (N) Paper Quizzes
Papers (1) → (N) Learning Analyses
```

## 🔐 보안 아키텍처

### 인증 & 인가
- **JWT 기반 인증**: Supabase Auth
- **Row Level Security**: 데이터 접근 제어
- **API 보안**: Next.js 미들웨어

### 데이터 보호
- **HTTPS**: 모든 통신 암호화
- **환경변수**: 민감 정보 보호
- **입력 검증**: API 레벨 검증

## ⚡ 성능 최적화

### Frontend 최적화
- **Code Splitting**: 자동 코드 분할
- **Image Optimization**: Next.js Image
- **Memoization**: React.memo, useMemo
- **Lazy Loading**: 컴포넌트 지연 로딩

### Backend 최적화
- **API Caching**: 응답 캐싱
- **Database Indexing**: 쿼리 최적화
- **Connection Pooling**: Supabase 자동 관리

## 🚀 확장성 고려사항

### 수평 확장
- **API Routes**: 독립적 스케일링
- **Supabase**: 자동 스케일링
- **CDN**: 정적 자산 배포

### 기능 확장
- **Microservices**: API 분리 가능
- **Plugin Architecture**: 컴포넌트 기반 확장
- **API Versioning**: 버전 관리 지원

## 📈 모니터링 & 로깅

### 성능 모니터링
- **Supabase Dashboard**: 데이터베이스 모니터링
- **Next.js Analytics**: 프론트엔드 성능
- **API Logging**: 백엔드 로그

### 에러 처리
- **Error Boundaries**: React 에러 처리
- **API Error Handling**: 구조화된 에러 응답
- **User Feedback**: 사용자 친화적 에러 메시지

## 🎨 사용자 경험 (UX)

### 학습 플로우
1. **논문 업로드**: 드래그 앤 드롭 지원
2. **AI 분석**: 실시간 진행률 표시
3. **인터랙티브 학습**: 퀴즈, 하이라이트, 요약
4. **진도 추적**: 학습 통계 및 분석

### 반응형 디자인
- **Mobile First**: 모바일 우선 설계
- **Progressive Enhancement**: 점진적 향상
- **Accessibility**: 접근성 고려

이 아키텍처는 AI 기반 학습 플랫폼의 요구사항을 충족하면서도 확장성과 유지보수성을 고려한 현대적인 웹 애플리케이션 구조를 제공합니다. 