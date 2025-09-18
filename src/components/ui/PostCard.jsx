import React from 'react';
import Card from './Card';
import Button from './Button';
import StarRating from './StarRating';
import PostActions from './PostActions';
import './PostCard.css';

const PostCard = ({ 
  post,
  onAuthorClick,
  onLike,
  onDislike,
  onComment,
  onBookmark,
  className = '',
  ...props 
}) => {
  const {
    id,
    author,
    image,
    title,
    description,
    rating,
    address,
    time,
    likes = 0,
    comments = 0,
    isLiked = false,
    isBookmarked = false
  } = post;

  return (
    <Card className={`post-card ${className}`} padding="none" hover {...props}>
      {/* Post Header */}
      <div className="post-card__header">
        <button 
          className="post-card__author"
          onClick={() => onAuthorClick?.(author)}
        >
          <div className="author__avatar">
            {author.avatar ? (
              <img src={author.avatar} alt={author.name} />
            ) : (
              author.name.charAt(0)
            )}
          </div>
          <div className="author__info">
            <div className="author__name">{author.name}</div>
            <div className="post__time">{time}</div>
          </div>
        </button>
        
        <Button variant="secondary" size="small" className="post-card__menu">
          ⋯
        </Button>
      </div>

      {/* Post Image */}
      {image && (
        <div className="post-card__media">
          <img src={image} alt={title} className="post-card__image" />
        </div>
      )}

      {/* Post Content */}
      <div className="post-card__content">
        <h3 className="post-card__title">{title}</h3>
        {description && (
          <p className="post-card__description">{description}</p>
        )}
        
        {rating && (
          <div className="post-card__rating">
            <StarRating rating={rating} size="small" />
          </div>
        )}
        
        {address && (
          <div className="post-card__address">
            <span className="address__icon">📍</span>
            <span className="address__text">{address}</span>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <PostActions
        postId={id}
        likes={likes}
        comments={comments}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        onLike={onLike}
        onDislike={onDislike}
        onComment={onComment}
        onBookmark={onBookmark}
      />
    </Card>
  );
};

export default PostCard;