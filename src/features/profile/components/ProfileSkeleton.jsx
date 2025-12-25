import React from 'react'
import { Skeleton } from '../../../components/ui'

const ProfileSkeleton = () => {
  return (
    <div className="profile-skeleton">
      <div style={{ padding: '20px' }}>
        <Skeleton 
          width="120px" 
          height="120px" 
          variant="circular"
          className="skeleton-mb-16"
        />
        <Skeleton 
          width="200px" 
          height="24px" 
          variant="text"
          className="skeleton-mb-8"
        />
        <Skeleton 
          width="150px" 
          height="16px" 
          variant="text"
        />
      </div>
    </div>
  )
}

export default ProfileSkeleton