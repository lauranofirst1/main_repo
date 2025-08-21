'use client'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    // 로그인된 사용자는 바로 학습 페이지로 리다이렉트
    window.location.href = '/topics'
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">학습 페이지로 이동 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            StudyWithAI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            지역 교육 격차 해결을 위한 AI 기반 학습 플랫폼
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto">
            모든 학생이 고품질의 교육 자료에 쉽게 접근하고, 
            개인화된 학습 경험을 통해 효과적으로 학습할 수 있도록 지원하는 공공 서비스입니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              🎓 학습 시작하기
            </Link>
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
            >
              📝 무료 회원가입
            </Link>
          </div>
        </div>

        {/* 해결하는 교육 문제 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">교육 격차 해결</h3>
            <p className="text-gray-600">
              지역별 교육 수준 차이로 인한 학습 기회 불균등 문제를 
              AI 기술로 해결하여 모든 학생에게 동등한 학습 기회를 제공합니다.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">🔓</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">학습 접근성 향상</h3>
            <p className="text-gray-600">
              고품질 학습 자료에 대한 접근 제한을 해결하고, 
              모든 기기에서 언제든지 학습할 수 있는 환경을 제공합니다.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">개인화 교육</h3>
            <p className="text-gray-600">
              획일화된 교육으로 인한 학습 효과 저하 문제를 해결하고, 
              개인 수준에 맞는 맞춤형 학습 경험을 제공합니다.
            </p>
          </div>
        </div>

        {/* 지역별 교육 문제 현황 */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🎯 해결하고자 하는 지역 교육 문제들
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🏫</div>
              <div>
                <h4 className="font-semibold text-gray-800">도시-농촌 격차</h4>
                <p className="text-sm text-gray-600">도시와 농촌 간의 교육 인프라와 학습 기회 차이</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💰</div>
              <div>
                <h4 className="font-semibold text-gray-800">경제적 격차</h4>
                <p className="text-sm text-gray-600">사교육 의존도 증가로 인한 경제적 부담과 교육 불평등</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📚</div>
              <div>
                <h4 className="font-semibold text-gray-800">학습 자료 부족</h4>
                <p className="text-sm text-gray-600">지역별 학습 자료 접근성과 품질 차이</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">👨‍🏫</div>
              <div>
                <h4 className="font-semibold text-gray-800">교사 부족</h4>
                <p className="text-sm text-gray-600">지역별 우수 교사 배치 불균형</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-semibold text-gray-800">학습 동기 부족</h4>
                <p className="text-sm text-gray-600">흥미를 잃기 쉬운 전통적인 학습 방식</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📈</div>
              <div>
                <h4 className="font-semibold text-gray-800">학업 성취도 차이</h4>
                <p className="text-sm text-gray-600">지역별 학업 성취도와 진학률 차이</p>
              </div>
            </div>
          </div>
        </div>

        {/* 해커톤 솔루션 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl text-white mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            🚀 AI 기반 교육 격차 해결
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3">AI 기술 활용</h3>
              <ul className="text-sm space-y-2 text-blue-100">
                <li>• GPT-4 기반 지능형 학습</li>
                <li>• 개인화된 학습 경험</li>
                <li>• 실시간 학습 분석</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-3">포용적 접근성</h3>
              <ul className="text-sm space-y-2 text-blue-100">
                <li>• 모든 기기에서 접근</li>
                <li>• 무료 공공 서비스</li>
                <li>• 지역 제약 없는 학습</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">데이터 기반 개선</h3>
              <ul className="text-sm space-y-2 text-blue-100">
                <li>• 학습 패턴 분석</li>
                <li>• 지속적 서비스 개선</li>
                <li>• 효과성 측정</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 기대 효과 */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            📈 기대되는 사회적 효과
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <div className="text-2xl mb-3">🎓</div>
              <h4 className="font-semibold text-gray-800">교육 민주화</h4>
              <p className="text-sm text-gray-700">
                모든 학생에게 동등한 학습 기회 제공으로 교육 격차 해결
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
              <div className="text-2xl mb-3">🌍</div>
              <h4 className="font-semibold text-gray-800">지역 균형 발전</h4>
              <p className="text-sm text-gray-700">
                교육 격차 해결을 통한 지역 간 균형 발전 촉진
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <div className="text-2xl mb-3">💡</div>
              <h4 className="font-semibold text-gray-800">사회적 가치 창출</h4>
              <p className="text-sm text-gray-700">
                AI 기술을 활용한 공공 서비스 혁신 모델 제시
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
