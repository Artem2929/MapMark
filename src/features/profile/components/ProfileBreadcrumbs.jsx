import React from 'react'
import { Breadcrumbs } from '../../../components/ui'

const breadcrumbItems = [
  { href: '/', label: 'Головна' },
  { label: 'Профіль' }
]

const ProfileBreadcrumbs = () => {
  return <Breadcrumbs items={breadcrumbItems} />
}

export default ProfileBreadcrumbs
