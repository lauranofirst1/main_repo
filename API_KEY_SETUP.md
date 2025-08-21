# 🔑 OpenAI API 키 설정 가이드

## ❌ 현재 문제
현재 `sk-proj-`로 시작하는 **프로젝트 키**를 사용하고 있습니다. 이는 OpenAI API와 호환되지 않습니다.

## ✅ 해결 방법

### 1. 올바른 API 키 생성

#### 1-1. OpenAI Platform 접속
1. [OpenAI Platform](https://platform.openai.com)에 로그인
2. 좌측 메뉴에서 **"API Keys"** 클릭

#### 1-2. 새 API 키 생성
1. **"Create new secret key"** 버튼 클릭
2. 키 이름 입력 (예: "StudyWithAI")
3. **"Create secret key"** 클릭
4. 생성된 키를 안전한 곳에 복사 (한 번만 표시됨)

#### 1-3. API 키 형식 확인
- ✅ **올바른 형식**: `sk-abc123def456...` (개인 API 키)
- ❌ **잘못된 형식**: `sk-proj-abc123...` (프로젝트 키)

### 2. 환경 변수 설정

#### 2-1. .env.local 파일 수정
```bash
# 프로젝트 루트의 .env.local 파일
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=sk-your_new_api_key_here  # 새로 생성한 개인 API 키
NEXT_PUBLIC_PDF_API_URL=http://localhost:8000
```

#### 2-2. 파일 저장 후 서버 재시작
```bash
# 개발 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

### 3. 설정 확인

#### 3-1. 브라우저 콘솔에서 확인
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 다음 메시지 확인:
   ```
   ✅ API 키 형식 확인 완료: sk-abc123...
   ```

#### 3-2. 퀴즈 생성 테스트
1. 학습 자료에서 퀴즈 생성 시도
2. AI가 생성한 실제 퀴즈가 나오는지 확인

## 🚨 주의사항

### API 키 보안
- API 키를 GitHub에 업로드하지 마세요
- `.env.local` 파일은 `.gitignore`에 포함되어야 합니다
- API 키를 공개하지 마세요

### 사용량 제한
- OpenAI API는 사용량에 따라 요금이 부과됩니다
- 무료 크레딧이 제공되지만 제한이 있습니다
- 사용량을 모니터링하세요

### 대안 (API 키가 없는 경우)
현재 시스템은 API 키가 없어도 더미 퀴즈를 생성하여 기능을 테스트할 수 있습니다.

## 🔧 문제 해결

### 여전히 401 오류가 발생하는 경우
1. API 키가 올바른 형식인지 확인 (`sk-`로 시작)
2. API 키가 만료되지 않았는지 확인
3. OpenAI 계정에 충분한 크레딧이 있는지 확인
4. 서버를 완전히 재시작했는지 확인

### 다른 오류가 발생하는 경우
- 브라우저 콘솔의 오류 메시지를 확인
- 서버 로그를 확인
- API 키 설정을 다시 확인

---

이 가이드를 따라 설정하면 AI 기능이 정상적으로 작동할 것입니다! 🚀 