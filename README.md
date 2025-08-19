# 🧠 StudyWithAI - AI 학습 플랫폼

**AI를 활용한 지능형 학습 및 퀴즈 생성 플랫폼**

[![Next.js](https://img.shields.io/badge/Next.js-13.5.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)

---

## 📖 프로젝트 소개

StudyWithAI는 AI 기술을 활용하여 학습을 혁신적으로 개선하는 플랫폼입니다. 대학생부터 중고등학생까지 모든 학습자가 PDF 문서(논문, 교과서, 학습자료 등)를 업로드하면 AI가 자동으로 분석하고, 맞춤형 퀴즈를 생성하며, 개인화된 학습 통계를 제공합니다.

### ✨ 주요 기능

- **📄 PDF 문서 업로드 및 분석** (논문, 교과서, 학습자료 등)
- **🤖 AI 자동 퀴즈 생성** (객관식, 단답형, 서술형)
- **📊 개인화된 학습 통계 및 차트**
- **📝 AI 번역 및 요약 기능**
- **💾 개인 정리노트 작성**
- **⭐ 즐겨찾기 및 최근 본 목록**
- **📱 반응형 웹 디자인**
- **🎯 학년별 맞춤 학습 콘텐츠**

---

## 🚀 빠른 시작

### 📋 필수 요구사항

- **Node.js** 22.x 이상
- **npm** 10.x 이상
- **Supabase** 계정 및 프로젝트

### 🔧 설치 및 실행

```bash
# 1. 프로젝트 클론
git clone [repository-url]
cd main_repo

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 실제 값으로 설정

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

---

## ⚙️ 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API (AI 퀴즈 생성용)
OPENAI_API_KEY=your_openai_api_key

# PDF 텍스트 추출 API (선택사항)
NEXT_PUBLIC_PDF_API_URL=http://localhost:8000
```

### 🔑 API 키 설정 가이드

1. **Supabase 설정**
   - [Supabase](https://supabase.com)에서 새 프로젝트 생성
   - Settings > API에서 URL과 anon key 복사

2. **OpenAI API 설정**
   - [OpenAI Platform](https://platform.openai.com)에서 API 키 생성
   - GPT-4o-mini 모델 사용 권장

---

## 📦 사용 가능한 스크립트

```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션용 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
npm run type-check # TypeScript 타입 체크
```

---

## 🏗️ 프로젝트 구조

```
src/
├── app/                    # Next.js 13 App Router
│   ├── api/               # API 라우트
│   ├── login/             # 로그인 페이지
│   ├── signup/            # 회원가입 페이지
│   └── topics/            # 토픽 및 문서 페이지
├── components/            # React 컴포넌트
│   ├── steps/             # 학습 단계별 컴포넌트
│   ├── ui/                # 재사용 가능한 UI 컴포넌트
│   └── pdf/               # PDF 관련 컴포넌트
├── lib/                   # 유틸리티 및 설정
├── models/                # TypeScript 타입 정의
└── hooks/                 # 커스텀 React 훅
```

---

## 🎯 주요 기능 상세

### 📚 학습 플로우

1. **토픽 생성** → 학습할 주제 생성
2. **PDF 업로드** → 학습 자료 PDF 파일 업로드
3. **AI 분석** → 문서 내용 자동 분석 및 텍스트 추출
4. **학습 단계**:
   - 📖 **읽기**: 원문 및 번역본 확인
   - 📝 **요약**: AI 요약 및 개인 정리노트
   - 🧠 **퀴즈**: AI 생성 퀴즈 풀이
   - 📊 **통계**: 학습 진도 및 성과 분석

### 🤖 AI 기능

- **퀴즈 생성**: 문서 내용 기반 맞춤형 퀴즈 (학년별 난이도 조절)
- **번역**: 한국어 번역 제공
- **요약**: 핵심 내용 AI 요약
- **채점**: 주관식 답변 AI 채점 및 피드백

### 📊 학습 통계

- 점수 분포 차트
- 시간별 학습 패턴
- 일일 학습 기록
- 최근 성적 추이

### 🎓 학년별 맞춤 기능

- **중고등학생**: 교과서 기반 학습, 기초 개념 설명
- **대학생**: 논문 분석, 심화 학습
- **일반인**: 다양한 주제의 학습 자료 활용

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 13** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Heroicons** - 아이콘
- **Chart.js** - 데이터 시각화

### Backend
- **Supabase** - 데이터베이스 및 인증
- **PostgreSQL** - 관계형 데이터베이스
- **OpenAI API** - AI 기능

### 기타
- **PDF.js** - PDF 렌더링
- **TipTap** - 리치 텍스트 에디터
- **Material-UI** - UI 컴포넌트

---

## 🔀 브랜치 전략

### 📁 브랜치 종류

| 브랜치 이름     | 설명 |
|------------------|------|
| `main`           | 프로덕션 배포용 (안정 버전) |
| `develop`        | 개발 통합 브랜치 |
| `feature/*`      | 새로운 기능 개발 |
| `fix/*`          | 버그 수정 |
| `hotfix/*`       | 긴급 수정 |

### ✅ PR 규칙

```
[feat] AI 퀴즈 생성 기능 추가
[fix] 로그인 오류 수정
[docs] README 업데이트
[refactor] 컴포넌트 구조 개선
```

---

## 🚀 배포

### Vercel 배포 (권장)

1. [Vercel](https://vercel.com)에 GitHub 저장소 연결
2. 환경변수 설정
3. 자동 배포 활성화

### 수동 배포

```bash
npm run build
npm run start
```

---

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

## 📞 문의

- **프로젝트 링크**: [https://github.com/your-username/studywithai](https://github.com/your-username/studywithai)
- **이슈 리포트**: [GitHub Issues](https://github.com/your-username/studywithai/issues)

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - 훌륭한 React 프레임워크
- [Supabase](https://supabase.com/) - 강력한 백엔드 서비스
- [OpenAI](https://openai.com/) - 혁신적인 AI 기술
- [Tailwind CSS](https://tailwindcss.com/) - 효율적인 CSS 프레임워크

---

<div align="center">

**StudyWithAI로 더 스마트한 학습을 시작하세요! 🧠✨**

</div>
