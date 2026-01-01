import { Link } from 'react-router-dom'
import './Breadcrumbs.css'

const Breadcrumbs = ({ items = [] }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null
  }

  return (
    <nav className="breadcrumbs">
      {items.map((item, index) => {
        if (!item || typeof item !== 'object') {
          console.warn(`Invalid breadcrumb item at index ${index}:`, item)
          return null
        }

        if (!item.label) {
          console.warn(`Missing label for breadcrumb item at index ${index}:`, item)
          return null
        }

        return (
          <span key={item.href || item.label || index} className="breadcrumb-item">
            {index > 0 && <span className="breadcrumb-separator">›</span>}
            {item.href ? (
              <Link to={item.href} className="breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-current">{item.label}</span>
            )}
          </span>
        )
      }).filter(Boolean)}
    </nav>
  )
}

export default Breadcrumbs