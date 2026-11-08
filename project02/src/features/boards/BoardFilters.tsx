import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Priority } from '@/types/api'

interface Props {
  q: string
  priority: Priority | ''
  label: string
  labels: string[]
  onChange: (key: 'q' | 'priority' | 'label', value: string) => void
}

export function BoardFilters({ q, priority, label, labels, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3" aria-label="Card filters">
      <label className="relative min-w-48 flex-1 sm:max-w-72">
        <span className="sr-only">Search cards</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={q}
          onChange={(event) => onChange('q', event.target.value)}
          placeholder="Search cards…"
          className="pl-9"
        />
      </label>
      <Select
        value={priority || 'all'}
        onValueChange={(value) => onChange('priority', value === 'all' ? '' : value)}
      >
        <SelectTrigger aria-label="Filter by priority" className="w-40">
          <SelectValue placeholder="All priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="high">High priority</SelectItem>
          <SelectItem value="medium">Medium priority</SelectItem>
          <SelectItem value="low">Low priority</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={label || 'all'}
        onValueChange={(value) => onChange('label', value === 'all' ? '' : value)}
      >
        <SelectTrigger aria-label="Filter by label" className="w-40">
          <SelectValue placeholder="All labels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All labels</SelectItem>
          {labels.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
