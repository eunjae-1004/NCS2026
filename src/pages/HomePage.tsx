import { useNavigate } from 'react-router-dom'
import { Search, Briefcase, Sparkles } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()

  const options = [
    {
      id: 'job',
      title: '직무로 찾기',
      description: '직무, 산업, 부서를 입력하여 능력단위를 검색합니다',
      icon: Briefcase,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/search?mode=job'),
    },
    {
      id: 'keyword',
      title: '키워드로 찾기',
      description: '키워드를 입력하여 능력단위를 검색합니다',
      icon: Search,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/search?mode=keyword'),
    },
    {
      id: 'recommendation',
      title: '추천으로 시작하기',
      description: '산업/부서별 추천 능력단위를 확인합니다',
      icon: Sparkles,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: () => navigate('/recommendation'),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          무엇을 하시겠어요?
        </h1>
        <p className="text-lg text-gray-600">
          NCS 능력단위를 검색하고 관리하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option) => {
          const Icon = option.icon
          return (
            <button
              key={option.id}
              onClick={option.onClick}
              className={`${option.color} ${option.hoverColor} text-white rounded-lg p-8 shadow-lg transition-all transform hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white/20 rounded-full p-4">
                  <Icon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold">{option.title}</h2>
                <p className="text-sm text-white/90 text-center">
                  {option.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* 최근 검색 또는 빠른 링크 */}
      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          빠른 링크
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/cart')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm"
          >
            선택목록 보기
          </button>
          <button
            onClick={() => navigate('/results')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm"
          >
            전체 결과 보기
          </button>
        </div>
      </div>
    </div>
  )
}


