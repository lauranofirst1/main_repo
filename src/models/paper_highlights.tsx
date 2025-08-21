// 문서 하이라이트를 저장하는 테이블
export interface PaperHighlight {
  highlight_id: number; // 하이라이트 고유 ID
  highlight_paper_id: number; // 소속 문서 ID
  highlight_content_id?: number; // 소속 콘텐츠 ID (선택사항)
  highlight_page_id?: string; // 페이지 ID (선택사항)
  highlight_text: string; // 하이라이트된 텍스트
  highlight_color: string; // 하이라이트 색상 (CSS 클래스명)
  highlight_start_offset: number; // 시작 오프셋
  highlight_end_offset: number; // 끝 오프셋
  highlight_user_id: string; // 하이라이트한 사용자 ID (UUID)
  highlight_created_at: string; // 생성 시간 (ISO 문자열)
  highlight_updated_at: string; // 수정 시간 (ISO 문자열)
}

// 하이라이트 생성 요청 인터페이스
export interface CreateHighlightRequest {
  paperId: number;
  contentId?: number;
  pageId?: string;
  text: string;
  color: string;
  startOffset: number;
  endOffset: number;
}

// 하이라이트 업데이트 요청 인터페이스
export interface UpdateHighlightRequest {
  highlightId: number;
  text?: string;
  color?: string;
  startOffset?: number;
  endOffset?: number;
} 