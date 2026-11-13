import { Button } from './Button'

interface PaginationProps {
  page: number
  pages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Product pages">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span>
        Page {page} of {pages}
      </span>
      <Button variant="secondary" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </nav>
  )
}
