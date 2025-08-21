export interface PaperFavorite {
    /** 즐겨찾기한 사용자 ID (uuid) */
    fav_user_id: string;
  
    /** 즐겨찾기된 문서 ID (bigint) */
    fav_paper_id: number;
  
    /** 즐겨찾기한 시간 (timestamp) */
    fav_created_at: string;
  }