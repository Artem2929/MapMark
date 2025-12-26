import React, { memo, useMemo } from 'react'

const ProfileStats = memo(({ photos = [], following = [], followers = [], posts = [] }) => {
  const stats = useMemo(() => [
    { label: 'Фото', count: photos.length },
    { label: 'Підписки', count: following.length },
    { label: 'Підписники', count: followers.length },
    { label: 'Пости', count: posts.length }
  ], [photos.length, following.length, followers.length, posts.length])

  return (
    <div className="profile-stats">
      <div className="profile-stats__grid">
        {stats.map(stat => (
          <div key={stat.label} className="profile-stats__item">
            <span className="profile-stats__count">{stat.count}</span>
            <span className="profile-stats__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

ProfileStats.displayName = 'ProfileStats'

export default ProfileStats