// src/components/Sidebar.tsx
'use client'

import React, { useEffect, useState } from 'react'
import LogoutButton from '@/components/ui/buttons/LogoutButton'
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { BookOpen, FileText, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'

type SidebarProps = { userName?: string; userEmail?: string }

interface Topic {
  topic_id: number
  topic_name: string
  topic_description?: string
  topic_created_at: string
}

interface Paper {
  paper_id: number
  paper_title: string
  paper_abstract?: string
  paper_created_at: string
  paper_topic_id: number
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { recent, favorites, handleTopicClick, toggleFavorite } = useSidebar()
  const [favoriteTopics, setFavoriteTopics] = useState<Topic[]>([])
  const [favoritePapers, setFavoritePapers] = useState<Paper[]>([])
  const [recentTopics, setRecentTopics] = useState<Topic[]>([])
  const [recentPapers, setRecentPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    fetchFavorites()
    fetchRecentViews()
    
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    // 주기적으로 최근 본 목록 새로고침 (30초마다)
    const interval = setInterval(() => {
      fetchRecentViews()
    }, 30000)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
      clearInterval(interval)
    }
  }, [])

  const fetchFavorites = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return

    // 즐겨찾기된 토픽 가져오기
    const { data: topicFavs, error: topicErr } = await supabase
      .from('topic_favorites')
      .select(`
        fav_topic_id,
        topics (
          topic_id,
          topic_name,
          topic_description,
          topic_created_at
        )
      `)
      .eq('fav_user_id', user.id)

    if (!topicErr && topicFavs) {
      setFavoriteTopics(topicFavs.map(fav => fav.topics as unknown as Topic))
    }

    // 즐겨찾기된 문서 가져오기
    const { data: paperFavs, error: paperErr } = await supabase
      .from('paper_favorites')
      .select(`
        fav_paper_id,
        paper (
          paper_id,
          paper_title,
          paper_abstract,
          paper_created_at,
          paper_topic_id
        )
      `)
      .eq('fav_user_id', user.id)

    if (!paperErr && paperFavs) {
      setFavoritePapers(paperFavs.map(fav => fav.paper as unknown as Paper))
    }

    setLoading(false)
  }

  const fetchRecentViews = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return

    try {
      const response = await fetch(`/api/get-recent-views?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRecentTopics(data.topicViews.map((view: any) => view.topics))
          setRecentPapers(data.paperViews.map((view: any) => view.paper))
        }
      }
    } catch (error) {
      console.error('최근 본 목록 조회 오류:', error)
    }
  }

  const toggleTopicFavorite = async (topicId: number) => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return

    const exists = favoriteTopics.some(t => t.topic_id === topicId)
    if (exists) {
      await supabase
        .from('topic_favorites')
        .delete()
        .eq('fav_user_id', user.id)
        .eq('fav_topic_id', topicId)
    } else {
      await supabase.from('topic_favorites').insert({
        fav_user_id: user.id,
        fav_topic_id: topicId,
        fav_created_at: new Date().toISOString(),
      })
    }
    fetchFavorites()
  }

  const togglePaperFavorite = async (paperId: number) => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return

    const exists = favoritePapers.some(p => p.paper_id === paperId)
    if (exists) {
      await supabase
        .from('paper_favorites')
        .delete()
        .eq('fav_user_id', user.id)
        .eq('fav_paper_id', paperId)
    } else {
      await supabase.from('paper_favorites').insert({
        fav_user_id: user.id,
        fav_paper_id: paperId,
        fav_created_at: new Date().toISOString(),
      })
    }
    fetchFavorites()
  }

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col h-screen overflow-hidden">
      {/* 사용자 정보 */}
      <div className="p-6 pb-4">
        <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">
              {userName ? userName.charAt(0).toUpperCase() : 'G'}
            </span>
          </div>
          <div className="ml-3">
            <p className="font-semibold text-gray-900 text-sm">{userName || 'Guest'}</p>
            <p className="text-xs text-gray-500">{userEmail || 'guest@example.com'}</p>
          </div>
        </div>
      </div>

      {/* 고정된 컨텐츠 영역 */}
      <div className="flex-1 px-6">
        {/* 최근 본 토픽 */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Calendar className="w-3 h-3 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-gray-700">최근 본 토픽</h2>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500 px-2">로딩 중...</p>
          ) : recentTopics.length ? (
            <div className="max-h-32 overflow-y-auto">
              <ul className="space-y-1">
                {recentTopics.slice(0, 2).map(topic => (
                  <li
                    key={topic.topic_id}
                    onClick={() => {
                      // 최근 본 기록 업데이트
                      if (user?.id) {
                        fetch(`/api/update-recent-view`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            userId: user.id,
                            type: 'topic',
                            itemId: topic.topic_id
                          })
                        })
                      }
                      router.push(`/topics/${topic.topic_id}`)
                    }}
                    className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-2"
                  >
                    <BookOpen className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate flex-1 min-w-0">{topic.topic_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 px-2">없음</p>
          )}
        </div>

        {/* 최근 본 문서 */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
              <Calendar className="w-3 h-3 text-white" />
            </div>
                          <h2 className="text-sm font-semibold text-gray-700">최근 본 문서</h2>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500 px-2">로딩 중...</p>
          ) : recentPapers.length ? (
            <div className="max-h-32 overflow-y-auto">
              <ul className="space-y-1">
                {recentPapers.slice(0, 2).map(paper => (
                  <li
                    key={paper.paper_id}
                    onClick={() => {
                      // 최근 본 기록 업데이트
                      if (user?.id) {
                        fetch(`/api/update-recent-view`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            userId: user.id,
                            type: 'paper',
                            itemId: paper.paper_id
                          })
                        })
                      }
                      router.push(`/topics/${paper.paper_topic_id}/${paper.paper_id}`)
                    }}
                    className="text-sm text-gray-700 cursor-pointer hover:text-purple-600 hover:bg-purple-50 px-2 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-2"
                  >
                    <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate flex-1 min-w-0">{paper.paper_title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 px-2">없음</p>
          )}
        </div>

        {/* 토픽 즐겨찾기 */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <StarSolid className="w-3 h-3 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-gray-700">토픽 즐겨찾기</h2>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500 px-2">로딩 중...</p>
          ) : favoriteTopics.length ? (
            <div className="max-h-40 overflow-y-auto">
              <ul className="space-y-1">
                {favoriteTopics.slice(0, 3).map(topic => (
                  <li
                    key={topic.topic_id}
                    className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-2 group"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTopicFavorite(topic.topic_id)
                      }}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      <StarSolid className="w-3 h-3 text-blue-500" />
                    </button>
                    <span 
                      className="truncate flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/topics/${topic.topic_id}`)}
                    >
                      {topic.topic_name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 px-2">없음</p>
          )}
        </div>

        {/* 문서 즐겨찾기 */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
              <StarSolid className="w-3 h-3 text-white" />
            </div>
                          <h2 className="text-sm font-semibold text-gray-700">문서 즐겨찾기</h2>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500 px-2">로딩 중...</p>
          ) : favoritePapers.length ? (
            <div className="max-h-40 overflow-y-auto">
              <ul className="space-y-1">
                {favoritePapers.slice(0, 3).map(paper => (
                  <li
                    key={paper.paper_id}
                    className="text-sm text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-2 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-2 group"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePaperFavorite(paper.paper_id)
                      }}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      <StarSolid className="w-3 h-3 text-purple-500" />
                    </button>
                    <span 
                      className="truncate flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/topics/${paper.paper_topic_id}/${paper.paper_id}`)}
                    >
                      {paper.paper_title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 px-2">없음</p>
          )}
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 mt-auto">
        <LogoutButton />
      </div>
    </aside>
  )
}
