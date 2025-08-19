// 학습 자료(Paper) 정보를 저장하는 테이블
export interface Paper {
  paper_id: number; // 학습 자료 고유 ID
  paper_topic_id: number; // 소속 주제 ID
  paper_title: string; // 학습 자료 제목
  paper_abstract?: string; // 학습 자료 초록
  paper_url?: string; // 학습 자료 URL
  paper_created_at: string; // 생성일시 (ISO 문자열)
} 