import { getCatalogImage } from '../../data/catalog'

export function CategoryCard({ title, image, link }: { title: string; image: string; link: string }) {
  return (
    <a className="category-card" href={link}>
      <img src={getCatalogImage(image)} alt={title} />
      <div className="category-overlay" />
      <div className="category-content"><h3>{title}</h3><span>Ver categoría</span></div>
    </a>
  )
}
