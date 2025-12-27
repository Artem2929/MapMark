import { Link } from 'react-router-dom'
import './Breadcrumbs.css'

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="breadcrumbs">
      {items.map((item, index) => (
        <span key={index} className="breadcrumb-item">
          {index > 0 && <span className="breadcrumb-separator">›</span>}
          {item.href ? (
            <Link to={item.href} className="breadcrumb-link">
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumbs