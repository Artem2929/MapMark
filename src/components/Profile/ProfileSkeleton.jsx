import React from 'react';
import Skeleton from '../ui/Skeleton';
import './ProfileSkeleton.css';

const ProfileSkeleton = () => {
  return (
    <div className="profile-skeleton">
      {/* Cover Photo Skeleton */}
      <Skeleton height="120px" className="profile-skeleton__cover" />
      
      <div className="profile-skeleton__content">
        <div className="profile-skeleton__header">
          {/* Avatar Skeleton */}
          <Skeleton width="120px" height="120px" variant="circular" className="profile-skeleton__avatar" />
          
          <div className="profile-skeleton__info">
            {/* Name Skeleton */}
            <Skeleton width="200px" height="28px" className="profile-skeleton__name" />
            {/* Username Skeleton */}
            <Skeleton width="120px" height="16px" className="profile-skeleton__username" />
            {/* Location Skeleton */}
            <Skeleton width="150px" height="14px" className="profile-skeleton__location" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="profile-skeleton__stats">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="profile-skeleton__stat">
              <Skeleton width="40px" height="20px" />
              <Skeleton width="60px" height="12px" />
            </div>
          ))}
        </div>

        {/* Photos Grid Skeleton */}
        <div className="profile-skeleton__photos">
          <Skeleton width="120px" height="20px" className="profile-skeleton__photos-title" />
          <div className="profile-skeleton__photos-grid">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} height="120px" className="profile-skeleton__photo" />
            ))}
          </div>
        </div>

        {/* Wall Skeleton */}
        <div className="profile-skeleton__wall">
          <Skeleton width="80px" height="18px" className="profile-skeleton__wall-title" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="profile-skeleton__post">
              <div className="profile-skeleton__post-header">
                <Skeleton width="40px" height="40px" variant="circular" />
                <div>
                  <Skeleton width="120px" height="14px" />
                  <Skeleton width="80px" height="12px" />
                </div>
              </div>
              <Skeleton height="60px" className="profile-skeleton__post-content" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;