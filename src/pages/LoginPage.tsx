import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getOrganizations, getStandardCodes } from '../services/apiService'
import { register, login, loginAsGuest } from '../services/apiService'
import { useAsync } from '../hooks/useAsync'
import Loading from '../components/Loading'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useStore()
  const [mode, setMode] = useState<'login' | 'register' | 'guest'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  const [showOrgSelection, setShowOrgSelection] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 기관 목록 로드
  const {
    data: organizations = [],
    loading: orgsLoading,
  } = useAsync(getOrganizations, { immediate: true })

  // 표준 코드 목록 로드 (회원가입 시에만)
  const {
    data: industries,
    loading: industriesLoading,
    execute: loadIndustries,
  } = useAsync(() => getStandardCodes('industries'), { immediate: false })

  const {
    data: departments,
    loading: departmentsLoading,
    execute: loadDepartments,
  } = useAsync(() => getStandardCodes('departments'), { immediate: false })

  const {
    data: jobs,
    loading: jobsLoading,
    execute: loadJobs,
  } = useAsync(() => getStandardCodes('jobs'), { immediate: false })
  
  const industriesList = industries || []
  const departmentsList = departments || []
  const jobsList = jobs || []

  // 회원가입 모드일 때만 표준 코드 로드
  useEffect(() => {
    if (mode === 'register') {
      loadIndustries()
      loadDepartments()
      loadJobs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      setError('이메일, 비밀번호, 이름을 모두 입력해주세요.')
      return
    }

    // 산업분야, 부서, 직무 필수값 검증
    if (!selectedIndustry || !selectedDepartment || !selectedJob) {
      setError('산업분야, 부서, 직무를 모두 선택해주세요.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const org = organizations?.find((o) => o.id === selectedOrg)
      
      // 이름을 직접 전송 (서버에서 standard_codes 자동 생성 및 alias_mapping 등록)
      const user = await register(
        email, 
        password, 
        name, 
        org?.id,
        selectedIndustry,
        selectedDepartment,
        selectedJob
      )
      await setUser(user)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const user = await login(email, password)
      await setUser(user)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    setLoading(true)
    setError('')

    try {
      const user = await loginAsGuest(name.trim() || undefined)
      await setUser(user)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Guest 로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          NCS 검색 시스템
        </h1>

        {/* 모드 선택 탭 */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => {
              setMode('login')
              setError('')
            }}
            className={`flex-1 py-2 px-4 text-center font-medium transition ${
              mode === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => {
              setMode('register')
              setError('')
            }}
            className={`flex-1 py-2 px-4 text-center font-medium transition ${
              mode === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            회원가입
          </button>
          <button
            onClick={() => {
              setMode('guest')
              setError('')
            }}
            className={`flex-1 py-2 px-4 text-center font-medium transition ${
              mode === 'guest'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Guest
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        {mode === 'login' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        )}

        {/* 회원가입 폼 */}
        {mode === 'register' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 * (최소 6자)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기관 (선택사항)
              </label>
              <button
                type="button"
                onClick={() => setShowOrgSelection(!showOrgSelection)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50 flex justify-between items-center"
              >
                <span className="text-gray-700">
                  {selectedOrg && organizations
                    ? organizations.find((o) => o.id === selectedOrg)?.name
                    : '기관 선택 (선택사항)'}
                </span>
                <span className="text-gray-400">▼</span>
              </button>

              {showOrgSelection && (
                <div className="mt-2 border border-gray-300 rounded-md bg-white shadow-lg">
                  {orgsLoading ? (
                    <div className="px-4 py-2 text-center text-gray-500">
                      <Loading message="기관 목록 로딩 중..." />
                    </div>
                  ) : (
                    (organizations || []).map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setSelectedOrg(org.id)
                          setShowOrgSelection(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 first:rounded-t-md last:rounded-b-md"
                      >
                        <div className="flex justify-between items-center">
                          <span>{org.name}</span>
                          <span className="text-xs text-gray-500">
                            {org.type === 'public' ? '공공' : '기업'}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                산업분야 *
                {industriesLoading && <span className="text-gray-400 ml-2">(로딩 중...)</span>}
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={industriesLoading}
                required
              >
                <option value="">선택하세요</option>
                {industriesList.length > 0 ? (
                  industriesList.map((industry) => (
                    <option key={industry.code} value={industry.name}>
                      {industry.name}
                    </option>
                  ))
                ) : (
                  !industriesLoading && <option value="" disabled>목록을 불러올 수 없습니다</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                부서 *
                {departmentsLoading && <span className="text-gray-400 ml-2">(로딩 중...)</span>}
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={departmentsLoading}
                required
              >
                <option value="">선택하세요</option>
                {departmentsList.length > 0 ? (
                  departmentsList.map((dept) => (
                    <option key={dept.code} value={dept.name}>
                      {dept.name}
                    </option>
                  ))
                ) : (
                  !departmentsLoading && <option value="" disabled>목록을 불러올 수 없습니다</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직무 *
                {jobsLoading && <span className="text-gray-400 ml-2">(로딩 중...)</span>}
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={jobsLoading}
                required
              >
                <option value="">선택하세요</option>
                {jobsList.length > 0 ? (
                  jobsList.map((job) => (
                    <option key={job.code} value={job.name}>
                      {job.name}
                    </option>
                  ))
                ) : (
                  !jobsLoading && <option value="" disabled>목록을 불러올 수 없습니다</option>
                )}
              </select>
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </div>
        )}

        {/* Guest 모드 */}
        {mode === 'guest' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Guest 모드:</strong> 검색 기능만 사용할 수 있습니다.
                <br />
                선택목록, 세트 저장 등은 회원가입 후 이용 가능합니다.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 (선택사항)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요 (선택사항)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleGuest()}
              />
            </div>
            <button
              onClick={handleGuest}
              disabled={loading}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '진입 중...' : 'Guest로 시작하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
