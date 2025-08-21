'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Settings as CogIcon, Star, FileText, Calendar } from 'lucide-react'

interface PaperCardProps {
  title: string
  description?: string
  date: string
  thumbnailUrl?: string
  onEdit: () => void
  onDelete: () => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onCardClick?: () => void
}

export default function PaperCard({
  title,
  description = '',
  date,
  thumbnailUrl = '/placeholder.png',
  onEdit,
  onDelete,
  isFavorite = false,
  onToggleFavorite,
  onCardClick,
}: PaperCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div 
      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-sm border border-blue-200 hover:shadow-lg hover:border-blue-400 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group h-64 flex flex-col cursor-pointer"
      onClick={onCardClick}
    >
      {/* 상단: 제목과 즐겨찾기 */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500 truncate">{date}</span>
              </div>
            </div>
          </div>
          
          {/* 즐겨찾기 버튼 */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                isFavorite 
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 hover:from-blue-200 hover:to-purple-200' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
              }`}
              aria-label="즐겨찾기 토글"
            >
              <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* 중간: 설명 */}
      <div className="p-4 flex-1 min-h-0">
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {description || '문서 설명이 없습니다.'}
        </p>
      </div>

      {/* 하단: 액션 버튼들 */}
      <div className="px-4 py-3 bg-white/70 backdrop-blur-sm border-t border-blue-200 flex-shrink-0 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            {isFavorite && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold flex-shrink-0 shadow-sm">
                즐겨찾기
              </span>
            )}
        </div>

          <div className="relative flex-shrink-0" ref={menuRef}>
          <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((v) => !v)
              }}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="문서 설정 메뉴 열기"
          >
              <CogIcon className="w-4 h-4 text-gray-500" />
          </button>

          {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
              <button
                  onClick={(e) => {
                    e.stopPropagation()
                  onEdit()
                  setMenuOpen(false)
                }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-lg"
              >
                수정하기
              </button>
              <button
                  onClick={(e) => {
                    e.stopPropagation()
                  onDelete()
                  setMenuOpen(false)
                }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg"
              >
                삭제하기
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
