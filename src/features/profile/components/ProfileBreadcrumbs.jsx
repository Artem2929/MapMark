import React from 'react'
import { Breadcrumbs } from '../../../components/ui'

const ProfileBreadcrumbs = () => {
  const breadcrumbItems = [
    { href: '/', label: 'Головна' },
    { label: 'Профіль' }
  ]

  return <Breadcrumbs items={breadcrumbItems} />
}

export default ProfileBreadcrumbs
