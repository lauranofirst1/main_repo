// src/components/Header.tsx
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Squares2X2Icon, Bars3Icon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  onOpenModal: () => void
  sortMode?: 'name' | 'created' | 'favorite' | 'recent'
  setSortMode?: (mode: 'name' | 'created' | 'favorite' | 'recent') => void
  buttonText?: string
}

export default function Header({
  searchQuery,
  onSearchChange,
  viewMode,
  setViewMode,
  onOpenModal,
  sortMode,
  setSortMode,
  buttonText = '토픽 추가',
}: HeaderProps) {
  const router = useRouter()

  return (
    <header className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* 검색 영역 */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
              onChange={(e) => {
                console.log('Header 검색 입력:', e.target.value)
                onSearchChange(e.target.value)
              }}
                              placeholder="문서 제목이나 내용으로 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              autoComplete="off"
        />
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-3">
          {/* 토픽 추가 버튼 */}
        <button
          onClick={onOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{buttonText}</span>
        </button>

          {/* 뷰 모드 토글 */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title="그리드 보기"
        >
              <Squares2X2Icon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title="리스트 보기"
        >
              <Bars3Icon className="w-5 h-5" />
        </button>
          </div>

          {/* 정렬 옵션 */}
          {sortMode && setSortMode && (
            <div className="flex items-center">
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as 'name' | 'created' | 'favorite' | 'recent')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="favorite">즐겨찾기순</option>
                <option value="recent">최근 본 순</option>
                <option value="created">최신순</option>
                <option value="name">이름순</option>
              </select>
            </div>
          )}


        </div>
      </div>
    </header>
  )
}
