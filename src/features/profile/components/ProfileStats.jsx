import { memo } from 'react'

const ProfileStats = memo(({ postsCount, followingCount, followersCount }) => {
  const stats = [
    { label: 'Записів', value: postsCount || 0 },
    { label: 'Підписок', value: followingCount || 0 },
    { label: 'Підписників', value: followersCount || 0 }
  ]

  return (
    <div className="profile-stats">
      {stats.map((stat, index) => (
        <button 
          key={stat.label} 
          className="stat-card"
          aria-label={`${stat.value} ${stat.label}`}
        >
          <span className="stat-number">{stat.value}</span>
          <span className="stat-label">{stat.label}</span>
        </button>
      ))}
    </div>
  )
})

ProfileStats.displayName = 'ProfileStats'

export default ProfileStats
