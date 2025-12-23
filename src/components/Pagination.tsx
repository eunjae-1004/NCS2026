import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '../types'

interface PaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, hasNext, hasPrev } = pagination

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // 전체 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 현재 페이지 주변 페이지 표시
      if (page <= 3) {
        // 처음 부분
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        // 끝 부분
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 중간 부분
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      {/* 이전 페이지 버튼 */}
      <button
        onClick={(e) => {
          e.preventDefault()
          if (hasPrev) {
            console.log('이전 페이지 버튼 클릭:', page - 1)
            onPageChange(page - 1)
          }
        }}
        disabled={!hasPrev}
        className={`px-3 py-2 rounded-md border ${
          hasPrev
            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
        } transition`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* 페이지 번호 */}
      {pageNumbers.map((pageNum, index) => {
        if (pageNum === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-gray-500"
            >
              ...
            </span>
          )
        }

        const pageNumber = pageNum as number
        const isActive = pageNumber === page

        return (
          <button
            key={pageNumber}
            onClick={(e) => {
              e.preventDefault()
              console.log('페이지 버튼 클릭:', pageNumber)
              onPageChange(pageNumber)
            }}
            className={`px-4 py-2 rounded-md border transition ${
              isActive
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNumber}
          </button>
        )
      })}

      {/* 다음 페이지 버튼 */}
      <button
        onClick={(e) => {
          e.preventDefault()
          if (hasNext) {
            console.log('다음 페이지 버튼 클릭:', page + 1)
            onPageChange(page + 1)
          }
        }}
        disabled={!hasNext}
        className={`px-3 py-2 rounded-md border ${
          hasNext
            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
        } transition`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 페이지 정보 */}
      <div className="ml-4 text-sm text-gray-600">
        {page} / {totalPages} 페이지
      </div>
    </div>
  )
}

