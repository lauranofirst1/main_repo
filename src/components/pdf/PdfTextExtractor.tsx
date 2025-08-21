import React, { useRef, useState } from 'react';
import { getPaperContents, PaperContent } from '@/lib/pdfApi';

interface PdfTextExtractorProps {
  paperId?: string;
}

export default function PdfTextExtractor({ paperId }: PdfTextExtractorProps) {
  const [contents, setContents] = useState<PaperContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputPaperId, setInputPaperId] = useState(paperId || '');

  const handleExtractText = async () => {
    if (!inputPaperId) {
              alert('문서 ID를 입력해주세요.');
      return;
    }

    setLoading(true);
    setContents([]);

    try {
      // 1. 먼저 외부 API로 PDF 텍스트 추출 요청
      const response = await fetch('/api/process-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paperId: inputPaperId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF 텍스트 추출 실패: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('PDF 텍스트 추출 완료');

      // 2. 추출된 문단들을 외부 API에서 가져오기
      const paperContents = await getPaperContents(inputPaperId);
      setContents(paperContents);
    } catch (error) {
      console.error('PDF 추출 오류:', error);
      alert('PDF 텍스트 추출에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputPaperId}
          onChange={(e) => setInputPaperId(e.target.value)}
                          placeholder="문서 ID를 입력하세요"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleExtractText}
          disabled={loading || !inputPaperId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '추출 중...' : '텍스트 추출'}
        </button>
      </div>
      
      {loading && <div className="text-center py-4">PDF에서 텍스트 추출 중...</div>}
      
      {contents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">추출된 문단 ({contents.length}개)</h3>
          <ul className="space-y-4">
            {contents.map((c, idx) => (
              <li key={idx} className="bg-gray-50 p-4 rounded-lg border">
                <div className="font-semibold text-gray-700 mb-2">문단 {c.content_index}</div>
                <div className="text-gray-800 whitespace-pre-wrap">{c.content_text}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 