# StudyWithAI - AI 학습 플랫폼 아키텍처

## 전체 시스템 아키텍처

```mermaid
graph TB
    subgraph "Frontend (Next.js 13)"
        A[사용자 인터페이스]
        B[React Components]
        C[Context Providers]
        D[Custom Hooks]
        E[Zustand Store]
    end
    
    subgraph "Backend (Next.js API Routes)"
        F[API Routes]
        G[PDF Processing]
        H[Quiz Generation]
        I[Summary Generation]
        J[Translation]
        K[Learning Analysis]
    end
    
    subgraph "External Services"
        L[OpenAI API]
        M[PDF Processing API]
        N[Supabase Database]
    end
    
    subgraph "Database (Supabase)"
        O[Users]
        P[Papers]
        Q[Paper Contents]
        R[Quizzes]
        S[Summaries]
        T[Learning Analytics]
        U[Topics]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    D --> F
    F --> G
    F --> H
    F --> I
    F --> J
    F --> K
    G --> M
    H --> L
    I --> L
    J --> L
    K --> L
    F --> N
    N --> O
    N --> P
    N --> Q
    N --> R
    N --> S
    N --> T
    N --> U
```

## 상세 컴포넌트 아키텍처

### 1. 프론트엔드 레이어

```mermaid
graph LR
    subgraph "Pages"
        A1[Login Page]
        A2[Signup Page]
        A3[Topics Page]
        A4[Paper Viewer]
        A5[Learning Flow]
        A6[Stats Page]
    end
    
    subgraph "Components"
        B1[Layout Components]
        B2[PDF Components]
        B3[Learning Components]
        B4[UI Components]
        B5[Modal Components]
    end
    
    subgraph "State Management"
        C1[AIAnalysisContext]
        C2[SidebarContext]
        C3[Zustand Store]
        C4[Custom Hooks]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B2
    A4 --> B3
    A5 --> B4
    A6 --> B5
    B1 --> C1
    B2 --> C2
    B3 --> C3
    B4 --> C4
```

### 2. API 레이어

```mermaid
graph TB
    subgraph "API Routes"
        D1[process-paper]
        D2[generate-quiz]
        D3[classify-and-summarize]
        D4[translate-paper]
        D5[learning-analysis]
        D6[save-paper-contents]
        D7[highlights]
        D8[topics]
    end
    
    subgraph "External APIs"
        E1[OpenAI GPT]
        E2[PDF Processing API]
        E3[Supabase Client]
    end
    
    D1 --> E2
    D2 --> E1
    D3 --> E1
    D4 --> E1
    D5 --> E1
    D6 --> E3
    D7 --> E3
    D8 --> E3
```

### 3. 데이터베이스 스키마

```mermaid
erDiagram
    USERS {
        string user_id PK
        string email
        string name
        timestamp created_at
    }
    
    TOPICS {
        string topic_id PK
        string topic_title
        string topic_description
        string user_id FK
        timestamp created_at
    }
    
    PAPERS {
        string paper_id PK
        string paper_title
        string paper_abstract
        string paper_url
        string topic_id FK
        timestamp created_at
    }
    
    PAPER_CONTENTS {
        string content_id PK
        string content_paper_id FK
        int content_index
        text content_text
        string content_page
    }
    
    PAPER_SUMMARIES {
        string summary_id PK
        string summary_paper_id FK
        text summary_content
        string summary_type
        timestamp created_at
    }
    
    PAPER_QUIZZES {
        string quiz_id PK
        string quiz_paper_id FK
        string quiz_question
        string quiz_choices
        string quiz_answer
        string quiz_explanation
        string quiz_type
    }
    
    LEARNING_ANALYSES {
        string analysis_id PK
        string analysis_paper_id FK
        string analysis_user_id FK
        json analysis_data
        timestamp created_at
    }
    
    USERS ||--o{ TOPICS : creates
    TOPICS ||--o{ PAPERS : contains
    PAPERS ||--o{ PAPER_CONTENTS : has
    PAPERS ||--o{ PAPER_SUMMARIES : has
    PAPERS ||--o{ PAPER_QUIZZES : has
    PAPERS ||--o{ LEARNING_ANALYSES : analyzed
    USERS ||--o{ LEARNING_ANALYSES : performs
```

## 기술 스택

### Frontend
- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS + Material-UI
- **State Management**: Zustand + React Context
- **PDF Viewer**: react-pdf
- **Rich Text Editor**: TipTap
- **Charts**: Chart.js + Recharts

### Backend
- **Runtime**: Node.js 22
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage

### External Services
- **AI Services**: OpenAI GPT API
- **PDF Processing**: External PDF API
- **Real-time**: Supabase Realtime

## 주요 기능 플로우

### 1. 논문 업로드 및 처리 플로우

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant P as PDF API
    participant S as Supabase
    
    U->>F: PDF 파일 업로드
    F->>A: process-paper API 호출
    A->>S: 논문 정보 저장
    A->>P: PDF 텍스트 추출 요청
    P->>A: 추출된 텍스트 반환
    A->>S: 논문 내용 저장
    A->>F: 처리 완료 응답
    F->>U: 업로드 완료 알림
```

### 2. AI 퀴즈 생성 플로우

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant O as OpenAI
    participant S as Supabase
    
    U->>F: 퀴즈 생성 요청
    F->>A: generate-quiz API 호출
    A->>S: 논문 내용 조회
    S->>A: 논문 내용 반환
    A->>O: 퀴즈 생성 요청
    O->>A: 생성된 퀴즈 반환
    A->>S: 퀴즈 저장
    A->>F: 퀴즈 데이터 반환
    F->>U: 퀴즈 표시
```

### 3. 학습 분석 플로우

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant O as OpenAI
    participant S as Supabase
    
    U->>F: 학습 완료
    F->>A: learning-analysis API 호출
    A->>S: 사용자 학습 데이터 조회
    S->>A: 학습 데이터 반환
    A->>O: 학습 분석 요청
    O->>A: 분석 결과 반환
    A->>S: 분석 결과 저장
    A->>F: 분석 결과 반환
    F->>U: 학습 통계 표시
```

## 보안 및 인증

- **Authentication**: Supabase Auth (JWT 기반)
- **Authorization**: Row Level Security (RLS)
- **API Security**: Next.js API Routes with middleware
- **Data Protection**: HTTPS, 환경변수 관리

## 성능 최적화

- **Frontend**: React.memo, useMemo, useCallback
- **Data Fetching**: SWR/React Query 패턴
- **Image Optimization**: Next.js Image 컴포넌트
- **Code Splitting**: Next.js 자동 코드 분할
- **Caching**: Supabase 캐싱, 브라우저 캐싱

## 확장성 고려사항

- **Microservices**: API Routes를 독립적인 서비스로 분리 가능
- **Database**: Supabase의 자동 스케일링
- **CDN**: 정적 자산 CDN 배포
- **Monitoring**: Supabase 대시보드, 로깅 