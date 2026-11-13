import { useState } from 'react'
import type { Product } from '../types/product'

export function Gallery({ product }: { product: Product }) {
  const images = product.images.length ? product.images : [product.thumbnail]
  const [selected, setSelected] = useState(images[0])

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={selected} alt={product.title} />
      </div>
      <div className="gallery-thumbs">
        {images.map((source, index) => (
          <button
            key={`${source}-${index}`}
            type="button"
            className={source === selected ? 'selected' : ''}
            onClick={() => setSelected(source)}
            aria-label={`Show image ${index + 1} of ${product.title}`}
            aria-pressed={source === selected}
          >
            <img src={source} alt={`${product.title}, view ${index + 1}`} loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  )
}
