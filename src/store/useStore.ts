import { create } from 'zustand'
import type { User, AbilityUnit, CartItem, CartSet, SearchFilters } from '../types'
import {
  saveCartSet as saveCartSetApi,
  getCartSets as getCartSetsApi,
  getCartSetById as getCartSetByIdApi,
  deleteCartSet as deleteCartSetApi,
  getCart as getCartApi,
  addCartItem as addCartItemApi,
  addMultipleCartItems as addMultipleCartItemsApi,
  removeCartItem as removeCartItemApi,
  updateCartItemMemo as updateCartItemMemoApi,
  clearCart as clearCartApi,
} from '../services/apiService'

interface AppState {
  // 사용자 정보
  user: User | null
  setUser: (user: User | null) => void

  // 검색 필터
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void

  // 선택목록
  cart: CartItem[]
  loadCart: () => Promise<void>
  addToCart: (abilityUnit: AbilityUnit, memo?: string) => Promise<void>
  addMultipleToCart: (abilityUnits: AbilityUnit[]) => Promise<void>
  removeFromCart: (abilityUnitId: string) => Promise<void>
  updateCartMemo: (abilityUnitId: string, memo: string) => Promise<void>
  clearCart: () => Promise<void>

  // 선택목록 세트
  cartSets: Omit<CartSet, 'items'>[]
  loadCartSets: () => Promise<void>
  saveCartSet: (name: string) => Promise<void>
  loadCartSet: (setId: string) => Promise<void>
  deleteCartSet: (setId: string) => Promise<void>

  // 선택 이력 기록
  selectedHistory: Array<{
    userId: string
    abilityUnitId: string
    selectedAt: Date
  }>
  recordSelection: (abilityUnitId: string) => void
}

// localStorage에서 사용자 정보 불러오기
const loadUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem('ncs_user')
    if (stored) {
      const user = JSON.parse(stored)
      // Date 객체 복원
      return user
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error)
  }
  return null
}

// 사용자 정보를 localStorage에 저장
const saveUserToStorage = (user: User | null) => {
  if (user) {
    localStorage.setItem('ncs_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('ncs_user')
  }
}

// localStorage에서 검색 필터 불러오기
const loadFiltersFromStorage = (): SearchFilters => {
  try {
    const stored = localStorage.getItem('ncs_filters')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('검색 필터 로드 실패:', error)
  }
  return {}
}

// 검색 필터를 localStorage에 저장
const saveFiltersToStorage = (filters: SearchFilters) => {
  try {
    if (filters && Object.keys(filters).length > 0) {
      localStorage.setItem('ncs_filters', JSON.stringify(filters))
    } else {
      localStorage.removeItem('ncs_filters')
    }
  } catch (error) {
    console.error('검색 필터 저장 실패:', error)
  }
}

export const useStore = create<AppState>((set) => ({
  // 사용자 정보 (초기값은 localStorage에서 불러오기)
  user: loadUserFromStorage(),
  setUser: async (user) => {
    set({ user })
    saveUserToStorage(user)
    // 사용자가 설정되면 선택목록 불러오기 (Guest 제외)
    if (user && user.role !== 'guest') {
      try {
        const items = await getCartApi(user.id)
        useStore.setState({ cart: items })
      } catch (error) {
        console.error('선택목록 로드 실패:', error)
      }
    } else {
      // 사용자가 null이거나 Guest면 선택목록 비우기
      useStore.setState({ cart: [] })
    }
  },

  // 검색 필터 (초기값은 localStorage에서 불러오기)
  filters: loadFiltersFromStorage(),
  setFilters: (filters) => {
    set({ filters })
    saveFiltersToStorage(filters)
  },

  // 선택목록
  cart: [],
  loadCart: async () => {
    const state = useStore.getState()
    if (!state.user || state.user.role === 'guest') return

    try {
      const items = await getCartApi(state.user.id)
      useStore.setState({ cart: items })
    } catch (error) {
      console.error('선택목록 로드 실패:', error)
    }
  },
  addToCart: async (abilityUnit, memo) => {
    const state = useStore.getState()
    if (!state.user) {
      throw new Error('로그인이 필요합니다.')
    }
    if (state.user.role === 'guest') {
      throw new Error('Guest 사용자는 선택목록 기능을 사용할 수 없습니다. 회원가입 후 이용해주세요.')
    }

    // 중복 확인
    const exists = state.cart.find(
      (item) => item.abilityUnit.id === abilityUnit.id
    )
    if (exists) {
      return // 이미 있으면 추가하지 않음
    }

    try {
      // DB에 저장 (code가 없으면 id 사용)
      const unitCode = abilityUnit.code || abilityUnit.id
      console.log('선택목록 추가:', { unitCode, abilityUnitId: abilityUnit.id, hasCode: !!abilityUnit.code })
      await addCartItemApi(state.user.id, unitCode, memo)
      // 로컬 상태 업데이트
      useStore.setState({
        cart: [...state.cart, { abilityUnit, memo, addedAt: new Date() }],
      })
    } catch (error) {
      console.error('선택목록 추가 실패:', error)
      throw error
    }
  },
  addMultipleToCart: async (abilityUnits) => {
    const state = useStore.getState()
    if (!state.user) {
      throw new Error('로그인이 필요합니다.')
    }
    if (state.user.role === 'guest') {
      throw new Error('Guest 사용자는 선택목록 기능을 사용할 수 없습니다. 회원가입 후 이용해주세요.')
    }

    const existingIds = new Set(state.cart.map((item) => item.abilityUnit.id))
    const newItems = abilityUnits
      .filter((unit) => !existingIds.has(unit.id))
      .map((unit) => ({
        abilityUnit: {
          ...unit,
          code: unit.code || unit.id, // code가 없으면 id 사용
        },
        memo: undefined,
        addedAt: new Date(),
      }))

    if (newItems.length === 0) return

    try {
      // DB에 저장
      console.log('선택목록 여러 개 추가:', { count: newItems.length, items: newItems.map(i => ({ id: i.abilityUnit.id, code: i.abilityUnit.code })) })
      await addMultipleCartItemsApi(state.user.id, newItems)
      // 로컬 상태 업데이트
      useStore.setState({
        cart: [...state.cart, ...newItems],
      })
    } catch (error) {
      console.error('선택목록 여러 개 추가 실패:', error)
      throw error
    }
  },
  removeFromCart: async (abilityUnitId) => {
    const state = useStore.getState()
    if (!state.user) {
      throw new Error('로그인이 필요합니다.')
    }

    try {
      // DB에서 삭제
      await removeCartItemApi(abilityUnitId, state.user.id)
      // 로컬 상태 업데이트
      useStore.setState({
        cart: state.cart.filter((item) => item.abilityUnit.id !== abilityUnitId),
      })
    } catch (error) {
      console.error('선택목록 삭제 실패:', error)
      throw error
    }
  },
  updateCartMemo: async (abilityUnitId, memo) => {
    const state = useStore.getState()
    if (!state.user) {
      throw new Error('로그인이 필요합니다.')
    }

    try {
      // DB에 업데이트
      await updateCartItemMemoApi(abilityUnitId, state.user.id, memo)
      // 로컬 상태 업데이트
      useStore.setState({
        cart: state.cart.map((item) =>
          item.abilityUnit.id === abilityUnitId ? { ...item, memo } : item
        ),
      })
    } catch (error) {
      console.error('메모 업데이트 실패:', error)
      throw error
    }
  },
  clearCart: async () => {
    const state = useStore.getState()
    if (!state.user) {
      throw new Error('로그인이 필요합니다.')
    }

    try {
      // DB에서 삭제
      await clearCartApi(state.user.id)
      // 로컬 상태 업데이트
      useStore.setState({ cart: [] })
    } catch (error) {
      console.error('선택목록 전체 삭제 실패:', error)
      throw error
    }
  },

  // 선택목록 세트
  cartSets: [],
  loadCartSets: async () => {
    const state = useStore.getState()
    if (!state.user || state.user.role === 'guest') return

    try {
      const sets = await getCartSetsApi(state.user.id)
      useStore.setState({ cartSets: sets })
    } catch (error) {
      console.error('세트 목록 로드 실패:', error)
    }
  },
  saveCartSet: async (name) => {
    const state = useStore.getState()
    if (state.cart.length === 0) {
      throw new Error('선택목록이 비어있습니다.')
    }
    if (!state.user) {
      throw new Error('로그인이 필요합니다.')
    }
    if (state.user.role === 'guest') {
      throw new Error('Guest 사용자는 세트 저장 기능을 사용할 수 없습니다. 회원가입 후 이용해주세요.')
    }

    try {
      await saveCartSetApi(state.user.id, name, state.cart)
      // 세트 목록 새로고침
      const sets = await getCartSetsApi(state.user.id)
      useStore.setState({ cartSets: sets })
    } catch (error) {
      console.error('세트 저장 실패:', error)
      throw error
    }
  },
  loadCartSet: async (setId) => {
    const state = useStore.getState()
    if (!state.user) {
      throw new Error('로그인이 필요합니다.')
    }

    try {
      const set = await getCartSetByIdApi(setId, state.user.id)
      useStore.setState({ cart: set.items })
    } catch (error) {
      console.error('세트 로드 실패:', error)
      throw error
    }
  },
  deleteCartSet: async (setId) => {
    const state = useStore.getState()
    if (!state.user) {
      throw new Error('로그인이 필요합니다.')
    }

    try {
      await deleteCartSetApi(setId, state.user.id)
      // 세트 목록 새로고침
      const sets = await getCartSetsApi(state.user.id)
      useStore.setState({ cartSets: sets })
    } catch (error) {
      console.error('세트 삭제 실패:', error)
      throw error
    }
  },

  // 선택 이력
  selectedHistory: [],
  recordSelection: (abilityUnitId) =>
    set((state) => {
      if (!state.user) return state
      return {
        selectedHistory: [
          ...state.selectedHistory,
          {
            userId: state.user.id,
            abilityUnitId,
            selectedAt: new Date(),
          },
        ],
      }
    }),
}))

