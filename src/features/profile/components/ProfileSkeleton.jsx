import React from 'react'
import '../../../components/ui/Skeleton/Skeleton.css'

const ProfileSkeleton = () => {
  return (
    <div className="profile-skeleton">
      <div style={{ padding: '20px' }}>
        <div className="skeleton skeleton--circular" style={{ 
          width: '120px', 
          height: '120px', 
          marginBottom: '16px'
        }}></div>
        <div className="skeleton skeleton--text" style={{ 
          width: '200px', 
          height: '24px', 
          marginBottom: '8px'
        }}></div>
        <div className="skeleton skeleton--text" style={{ 
          width: '150px', 
          height: '16px'
        }}></div>
      </div>
    </div>
  )
}

export default ProfileSkeleton