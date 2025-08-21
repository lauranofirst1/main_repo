# Supabase Storage 설정 가이드

## 1. Supabase Storage 버킷 생성

Supabase 대시보드에서 다음 단계를 따라 Storage 버킷을 생성하세요:

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 에서 프로젝트 선택

2. **Storage 메뉴로 이동**
   - 왼쪽 사이드바에서 "Storage" 클릭

3. **새 버킷 생성**
   - "New bucket" 버튼 클릭
   - 버킷 이름: `papers`
   - Public bucket: 체크 해제 (보안을 위해)
   - "Create bucket" 클릭

## 2. Storage 정책 설정 (단순화)

Storage는 단순히 파일 저장용으로만 사용하므로, 모든 인증된 사용자에게 업로드 권한을 부여합니다:

```sql
-- 모든 인증된 사용자에게 Storage 업로드 권한
CREATE POLICY "Enable storage for authenticated users" ON storage.objects
FOR ALL USING (auth.role() = 'authenticated');
```

## 3. Paper 테이블 정책 설정

실제 권한 관리는 `paper` 테이블에서 수행합니다:

```sql
-- 사용자가 자신의 주제에만 논문 추가 가능
CREATE POLICY "Allow users to insert papers under their own topics"
ON paper
FOR INSERT
TO authenticated
WITH CHECK (
  paper_topic_id IN (
    SELECT topic_id FROM topics
    WHERE topic_user_id = auth.uid()
  )
);

-- 사용자가 자신의 주제의 논문만 조회 가능
CREATE POLICY "Allow users to select papers under their own topics"
ON paper
FOR SELECT
TO authenticated
USING (
  paper_topic_id IN (
    SELECT topic_id FROM topics
    WHERE topic_user_id = auth.uid()
  )
);

-- 사용자가 자신의 주제의 논문만 수정 가능
CREATE POLICY "Allow users to update papers under their own topics"
ON paper
FOR UPDATE
TO authenticated
USING (
  paper_topic_id IN (
    SELECT topic_id FROM topics
    WHERE topic_user_id = auth.uid()
  )
);

-- 사용자가 자신의 주제의 논문만 삭제 가능
CREATE POLICY "Allow users to delete papers under their own topics"
ON paper
FOR DELETE
TO authenticated
USING (
  paper_topic_id IN (
    SELECT topic_id FROM topics
    WHERE topic_user_id = auth.uid()
  )
);
```

## 4. 환경 변수 확인

`.env.local` 파일에 다음 환경 변수가 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. 파일 구조

업로드된 PDF 파일은 다음 구조로 저장됩니다:
```
papers/
├── {topicId}/
│   ├── {timestamp}_{filename}.pdf
│   └── ...
```

`paper` 테이블의 `paper_url` 컬럼에 이 경로가 저장됩니다.

## 6. 보안 고려사항

- 파일 크기 제한: 10MB
- 파일 타입 제한: PDF만 허용
- 인증된 사용자만 접근 가능
- 사용자는 자신의 주제에만 논문 추가 가능
- 파일명 중복 방지를 위한 타임스탬프 추가

## 7. 문제 해결

### 업로드 실패 시 확인사항:
1. Supabase 프로젝트 URL과 API 키가 올바른지 확인
2. Storage 버킷이 생성되었는지 확인
3. Storage와 paper 테이블의 RLS 정책이 올바르게 설정되었는지 확인
4. 사용자가 인증되었는지 확인
5. 사용자가 해당 주제의 소유자인지 확인

### 일반적인 오류:
- `Bucket not found`: 버킷 이름 확인
- `Policy violation`: RLS 정책 확인
- `File too large`: 파일 크기 제한 확인
- `Invalid file type`: PDF 파일인지 확인
- `Unauthorized`: 사용자 권한 확인 

# Supabase 설정 가이드

## 📋 기본 설정

### 1. 프로젝트 생성
1. [Supabase](https://supabase.com)에 로그인
2. 새 프로젝트 생성
3. 프로젝트 이름: `studywithai`
4. 데이터베이스 비밀번호 설정

### 2. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_PDF_API_URL=http://localhost:8000
```

## 🗄️ 데이터베이스 테이블 생성

### 1. 사용자 테이블 (자동 생성됨)
```sql
-- auth.users 테이블은 Supabase Auth에서 자동 생성됨
```

### 2. 주제 테이블
```sql
CREATE TABLE topics (
  topic_id BIGSERIAL PRIMARY KEY,
  topic_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_title VARCHAR(255) NOT NULL,
  topic_description TEXT,
  topic_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 학습 자료 테이블
```sql
CREATE TABLE paper (
  paper_id BIGSERIAL PRIMARY KEY,
  paper_topic_id BIGINT REFERENCES topics(topic_id) ON DELETE CASCADE,
  paper_title VARCHAR(500) NOT NULL,
  paper_abstract TEXT,
  paper_url TEXT,
  paper_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 학습 자료 콘텐츠 테이블
```sql
CREATE TABLE paper_contents (
  content_id BIGSERIAL PRIMARY KEY,
  content_paper_id BIGINT REFERENCES paper(paper_id) ON DELETE CASCADE,
  content_type VARCHAR(50) DEFAULT 'paragraph',
  content_index INTEGER NOT NULL,
  content_text TEXT NOT NULL,
  content_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. 요약 테이블
```sql
CREATE TABLE paper_summaries (
  summary_id BIGSERIAL PRIMARY KEY,
  summary_content_id BIGINT REFERENCES paper_contents(content_id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  summary_type VARCHAR(50) DEFAULT 'AI_요약',
  summary_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. 퀴즈 테이블
```sql
CREATE TABLE paper_quizzes (
  quiz_id BIGSERIAL PRIMARY KEY,
  quiz_content_id BIGINT REFERENCES paper_contents(content_id) ON DELETE CASCADE,
  quiz_question TEXT NOT NULL,
  quiz_options JSONB NOT NULL,
  quiz_correct_answer VARCHAR(10) NOT NULL,
  quiz_explanation TEXT,
  quiz_evidence TEXT,
  quiz_difficulty VARCHAR(20) DEFAULT 'medium',
  quiz_type VARCHAR(50) DEFAULT 'multiple_choice',
  quiz_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. 테스트 시도 테이블
```sql
CREATE TABLE test_attempts (
  attempt_id BIGSERIAL PRIMARY KEY,
  attempt_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_paper_id BIGINT REFERENCES paper(paper_id) ON DELETE CASCADE,
  attempt_score INTEGER,
  attempt_total_questions INTEGER,
  attempt_correct_answers INTEGER,
  attempt_time_taken INTEGER, -- 초 단위
  attempt_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. 테스트 응답 아이템 테이블
```sql
CREATE TABLE test_attempt_items (
  item_id BIGSERIAL PRIMARY KEY,
  item_attempt_id BIGINT REFERENCES test_attempts(attempt_id) ON DELETE CASCADE,
  item_quiz_id BIGINT REFERENCES paper_quizzes(quiz_id) ON DELETE CASCADE,
  item_user_answer VARCHAR(10),
  item_is_correct BOOLEAN,
  item_time_taken INTEGER, -- 초 단위
  item_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9. 학습 분석 테이블
```sql
CREATE TABLE learning_analyses (
  analysis_id BIGSERIAL PRIMARY KEY,
  analysis_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_paper_id BIGINT REFERENCES paper(paper_id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL,
  analysis_data JSONB NOT NULL,
  analysis_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 10. 즐겨찾기 테이블들
```sql
-- 주제 즐겨찾기
CREATE TABLE topic_favorites (
  fav_id BIGSERIAL PRIMARY KEY,
  fav_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fav_topic_id BIGINT REFERENCES topics(topic_id) ON DELETE CASCADE,
  fav_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fav_user_id, fav_topic_id)
);

-- 학습 자료 즐겨찾기
CREATE TABLE paper_favorites (
  fav_id BIGSERIAL PRIMARY KEY,
  fav_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fav_paper_id BIGINT REFERENCES paper(paper_id) ON DELETE CASCADE,
  fav_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fav_user_id, fav_paper_id)
);
```

### 11. 최근 본 테이블들
```sql
-- 주제 최근 본
CREATE TABLE topic_recent_views (
  view_id BIGSERIAL PRIMARY KEY,
  view_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  view_topic_id BIGINT REFERENCES topics(topic_id) ON DELETE CASCADE,
  view_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 학습 자료 최근 본
CREATE TABLE paper_recent_views (
  view_id BIGSERIAL PRIMARY KEY,
  view_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  view_paper_id BIGINT REFERENCES paper(paper_id) ON DELETE CASCADE,
  view_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 12. 하이라이트 테이블
```sql
CREATE TABLE paper_highlights (
  highlight_id BIGSERIAL PRIMARY KEY,
  highlight_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  highlight_paper_id BIGINT REFERENCES paper(paper_id) ON DELETE CASCADE,
  highlight_content_id BIGINT REFERENCES paper_contents(content_id) ON DELETE CASCADE,
  highlight_text TEXT NOT NULL,
  highlight_color VARCHAR(20) DEFAULT 'yellow',
  highlight_note TEXT,
  highlight_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 13. 오답 노트 테이블
```sql
CREATE TABLE wrong_answer_notes (
  note_id BIGSERIAL PRIMARY KEY,
  note_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note_quiz_id BIGINT REFERENCES paper_quizzes(quiz_id) ON DELETE CASCADE,
  note_user_answer VARCHAR(10),
  note_explanation TEXT,
  note_review_count INTEGER DEFAULT 0,
  note_last_reviewed_at TIMESTAMP WITH TIME ZONE,
  note_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 14. 오답 학습 세션 테이블
```sql
CREATE TABLE wrong_answer_study_sessions (
  session_id BIGSERIAL PRIMARY KEY,
  session_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_note_id BIGINT REFERENCES wrong_answer_notes(note_id) ON DELETE CASCADE,
  session_result VARCHAR(20) NOT NULL, -- 'correct', 'incorrect'
  session_time_taken INTEGER, -- 초 단위
  session_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Row Level Security (RLS) 설정

### 1. RLS 활성화
```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_recent_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_recent_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answer_study_sessions ENABLE ROW LEVEL SECURITY;
```

### 2. 정책 생성
```sql
-- 주제 정책
CREATE POLICY "Users can view their own topics" ON topics
  FOR SELECT USING (auth.uid() = topic_user_id);

CREATE POLICY "Users can insert their own topics" ON topics
  FOR INSERT WITH CHECK (auth.uid() = topic_user_id);

CREATE POLICY "Users can update their own topics" ON topics
  FOR UPDATE USING (auth.uid() = topic_user_id);

CREATE POLICY "Users can delete their own topics" ON topics
  FOR DELETE USING (auth.uid() = topic_user_id);

-- 학습 자료 정책 (주제 소유자만 접근)
CREATE POLICY "Topic owners can view papers" ON paper
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM topics 
      WHERE topics.topic_id = paper.paper_topic_id 
      AND topics.topic_user_id = auth.uid()
    )
  );

CREATE POLICY "Topic owners can insert papers" ON paper
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM topics 
      WHERE topics.topic_id = paper.paper_topic_id 
      AND topics.topic_user_id = auth.uid()
    )
  );

CREATE POLICY "Topic owners can update papers" ON paper
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM topics 
      WHERE topics.topic_id = paper.paper_topic_id 
      AND topics.topic_user_id = auth.uid()
    )
  );

CREATE POLICY "Topic owners can delete papers" ON paper
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM topics 
      WHERE topics.topic_id = paper.paper_topic_id 
      AND topics.topic_user_id = auth.uid()
    )
  );

-- 나머지 테이블들도 비슷한 패턴으로 정책 생성
-- (사용자별 접근 제어 또는 주제 소유자별 접근 제어)
```

## 📁 Storage 설정

### 1. Storage 버킷 생성
```sql
-- PDF 파일 저장용 버킷
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdf-files', 'pdf-files', false);
```

### 2. Storage 정책 설정
```sql
-- PDF 파일 업로드 정책
CREATE POLICY "Users can upload PDF files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pdf-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- PDF 파일 조회 정책
CREATE POLICY "Users can view their PDF files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pdf-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- PDF 파일 삭제 정책
CREATE POLICY "Users can delete their PDF files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pdf-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## ⚙️ 파일 업로드 크기 제한 설정

### 1. Supabase Dashboard에서 설정
1. Supabase 프로젝트 대시보드 접속
2. Settings > API 메뉴로 이동
3. **Request Limits** 섹션에서:
   - **Max request size**: `20MB`로 설정
   - **Max request duration**: `300`초 (5분)로 설정

### 2. Storage 설정
1. Storage > Settings 메뉴로 이동
2. **File size limit**: `20MB`로 설정
3. **Allowed MIME types**: `application/pdf` 추가

### 3. 환경 변수 추가
`.env.local` 파일에 다음 설정 추가:
```env
# 파일 업로드 설정
NEXT_PUBLIC_MAX_FILE_SIZE=20971520  # 20MB in bytes
NEXT_PUBLIC_ALLOWED_FILE_TYPES=application/pdf
NEXT_PUBLIC_API_TIMEOUT=300000  # 5분 (300초)
```

## 🔧 추가 설정

### 1. 인덱스 생성 (성능 최적화)
```sql
-- 자주 조회되는 컬럼에 인덱스 생성
CREATE INDEX idx_topics_user_id ON topics(topic_user_id);
CREATE INDEX idx_paper_topic_id ON paper(paper_topic_id);
CREATE INDEX idx_paper_contents_paper_id ON paper_contents(content_paper_id);
CREATE INDEX idx_paper_quizzes_content_id ON paper_quizzes(quiz_content_id);
CREATE INDEX idx_test_attempts_user_id ON test_attempts(attempt_user_id);
CREATE INDEX idx_test_attempts_paper_id ON test_attempts(attempt_paper_id);
```

### 2. 함수 생성 (자동 정리)
```sql
-- 오래된 최근 본 기록 자동 정리 함수
CREATE OR REPLACE FUNCTION cleanup_old_recent_views()
RETURNS void AS $$
BEGIN
  -- 30일 이상 된 최근 본 기록 삭제
  DELETE FROM topic_recent_views 
  WHERE view_created_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM paper_recent_views 
  WHERE view_created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 매일 자동 실행되도록 스케줄 설정 (선택사항)
-- SELECT cron.schedule('cleanup-recent-views', '0 2 * * *', 'SELECT cleanup_old_recent_views();');
```

## 🚀 배포 후 확인사항

### 1. 데이터베이스 연결 확인
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:3000
```

### 2. 파일 업로드 테스트
- 20MB 이하 PDF 파일 업로드 테스트
- 업로드 진행률 표시 확인
- 파일 처리 완료 확인

### 3. 보안 설정 확인
- RLS 정책이 올바르게 작동하는지 확인
- 다른 사용자의 데이터에 접근할 수 없는지 확인

## 📝 참고사항

- **파일 크기 제한**: 20MB (설정 가능)
- **지원 파일 형식**: PDF만 지원
- **업로드 타임아웃**: 5분 (대용량 파일 처리용)
- **저장소 구조**: 사용자별 폴더 구조로 관리
- **보안**: RLS를 통한 사용자별 데이터 격리

이 설정을 완료하면 20MB까지의 PDF 파일을 안전하게 업로드하고 처리할 수 있습니다! 🎉 