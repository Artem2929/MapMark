import React from 'react'
import { Link } from 'react-router-dom'
import '../../../components/ui/Breadcrumbs/Breadcrumbs.css'

const ProfileBreadcrumbs = () => {
  return (
    <nav className="breadcrumbs">
      <div className="breadcrumb-item">
        <Link to="/" className="breadcrumb-link">
          Головна
        </Link>
      </div>
      <span className="breadcrumb-separator">/</span>
      <div className="breadcrumb-item">
        <span className="breadcrumb-current">
          Профіль
        </span>
      </div>
    </nav>
  )
}

export default ProfileBreadcrumbs
