import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { LogOut, ClipboardList, Home } from 'lucide-react'

export default function Layout() {
  const { user, setUser, cart, loadCart } = useStore()
  const navigate = useNavigate()

  // 컴포넌트 마운트 시 사용자 정보가 있으면 선택목록 불러오기 (Guest 제외)
  useEffect(() => {
    if (user && user.role !== 'guest') {
      loadCart().catch((error) => {
        console.error('선택목록 자동 로드 실패:', error)
      })
    }
  }, [user, loadCart])

  const handleLogout = () => {
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <Home className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  NCS 검색 시스템
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className={user.role === 'guest' ? 'text-gray-500' : 'text-gray-600'}>
                    {user.name}
                    {user.role === 'guest' && (
                      <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                        Guest
                      </span>
                    )}
                  </span>
                  {user.organization && (
                    <span className="text-gray-400">({user.organization})</span>
                  )}
                </div>
              )}

              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-blue-600 transition"
              >
                <ClipboardList className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}


