interface CatalogFiltersProps {
  query: string
  category: string
  sort: string
  categories: string[]
  onQueryChange: (query: string) => void
  onCategoryChange: (category: string) => void
  onSortChange: (sort: string) => void
}

export function CatalogFilters({
  query,
  category,
  sort,
  categories,
  onQueryChange,
  onCategoryChange,
  onSortChange,
}: CatalogFiltersProps) {
  return (
    <div className="filters">
      <label>
        Search products
        <input
          type="search"
          placeholder="Search by name…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <label>
        Category
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll('-', ' ')}
            </option>
          ))}
        </select>
      </label>
      <label>
        Sort by
        <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
          <option value="">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating-desc">Top rated</option>
        </select>
      </label>
    </div>
  )
}
