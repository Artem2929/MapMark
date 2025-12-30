import './FriendCardSkeleton.css'

const FriendCardSkeleton = () => {
  return (
    <div className="friend-card-skeleton">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-info">
        <div className="skeleton-name"></div>
        <div className="skeleton-meta"></div>
      </div>
      <div className="skeleton-actions">
        <div className="skeleton-button"></div>
      </div>
    </div>
  )
}

export default FriendCardSkeleton