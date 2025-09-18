import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import StarRating from './StarRating';
import './AdCard.css';

const AdCard = ({ 
  ad,
  className = '',
  ...props 
}) => {
  const {
    id,
    title,
    description,
    category,
    rating,
    distance,
    image,
    tags = [],
    isNew,
    isPopular,
    hasPromo
  } = ad;

  const getCategoryIcon = (category) => {
    const icons = {
      cafe: '☕',
      restaurant: '🍽️',
      park: '🌳',
      museum: '🏛️'
    };
    return icons[category] || '📍';
  };

  const getCategoryName = (category) => {
    const names = {
      cafe: 'Кафе',
      restaurant: 'Ресторан',
      park: 'Парк',
      museum: 'Музей'
    };
    return names[category] || category;
  };

  return (
    <Link to={`/ads/${id}`} className={`ad-card-link ${className}`} {...props}>
      <Card variant="glass" hover padding="none" className="ad-card">
        <div className="ad-card__image">
          <img src={image} alt={title} />
          
          <div className="ad-card__badges">
            {isNew && <span className="ad-badge ad-badge--new">Нове</span>}
            {isPopular && <span className="ad-badge ad-badge--popular">Популярне</span>}
            {hasPromo && <span className="ad-badge ad-badge--promo">Акція</span>}
          </div>
          
          <div className="ad-card__distance">{distance} км</div>
        </div>
        
        <div className="ad-card__content">
          <div className="ad-card__category">
            {getCategoryIcon(category)} {getCategoryName(category)}
          </div>
          
          <h3 className="ad-card__title">{title}</h3>
          <p className="ad-card__description">{description}</p>
          
          <div className="ad-card__rating">
            <StarRating rating={rating} size="small" />
            <span className="ad-card__rating-text">{rating.toFixed(1)}</span>
          </div>
          
          <div className="ad-card__tags">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className="ad-card__tag">{tag}</span>
            ))}
            {tags.length > 2 && (
              <span className="ad-card__more-tags">+{tags.length - 2}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default AdCard;