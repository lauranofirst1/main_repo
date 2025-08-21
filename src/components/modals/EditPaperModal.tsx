// src/components/modals/EditPaperModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Paper } from '@/models/paper'

interface EditPaperModalProps {
  paper: Paper
  onClose: () => void
  onSave: (updated: { paper_title: string; paper_abstract?: string }) => void
}

export default function EditPaperModal({
  paper,
  onClose,
  onSave,
}: EditPaperModalProps) {
  const [title, setTitle] = useState(paper.paper_title)
  const [abstract, setAbstract] = useState(paper.paper_abstract || '')

  useEffect(() => {
    setTitle(paper.paper_title)
    setAbstract(paper.paper_abstract || '')
  }, [paper])

  const handleSave = () => {
    onSave({
      paper_title: title,
      paper_abstract: abstract,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">문서 수정</h2>
        
                  <label className="text-sm font-semibold">문서 제목</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <label className="text-sm font-semibold">설명</label>
        <input
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            취소
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded">
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
