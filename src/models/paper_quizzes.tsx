// 학습 자료 콘텐츠 기반 퀴즈 정보를 저장하는 테이블
export interface PaperQuiz {
  quiz_id: number; // 퀴즈 고유 ID
  quiz_content_id: number; // 소속 콘텐츠 ID
  quiz_type?: string; // 퀴즈 타입(예: 객관식 등)
  quiz_question: string; // 퀴즈 질문
  quiz_choices?: any; // 선택지(JSON, 객관식일 경우)
  quiz_answer: string; // 정답
  quiz_explanation?: string; // 해설
  quiz_category?: string; // 퀴즈 카테고리(예: 개념 이해, 원리 및 구조 등)
  // 근거 관련 필드 추가
  quiz_evidence?: string; // 퀴즈 정답의 근거 텍스트
  quiz_evidence_start_index?: number; // 근거 텍스트 시작 위치
  quiz_evidence_end_index?: number; // 근거 텍스트 끝 위치
} 