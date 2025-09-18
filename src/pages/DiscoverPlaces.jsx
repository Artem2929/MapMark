import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/ui/Breadcrumbs.jsx";

import PostActions from "../components/ui/PostActions.jsx";
import "./DiscoverPlaces.css";

const DiscoverPlaces = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const categories = [
    { id: 'all', name: 'Всі', emoji: '🌍' },
    { id: 'recreation', name: 'Відпочинок', emoji: '🏖️' },
    { id: 'accommodation', name: 'Житло', emoji: '🏨' },
    { id: 'cafe', name: 'Кафе', emoji: '☕' },
    { id: 'restaurant', name: 'Ресторани', emoji: '🍽️' },
    { id: 'hotel', name: 'Готелі', emoji: '🏩' },
    { id: 'attraction', name: 'Памятки', emoji: '🏛️' },
    { id: 'nature', name: 'Природа', emoji: '🌲' },
    { id: 'shopping', name: 'Шопінг', emoji: '🛍️' }
  ];

  const mockPosts = [
    {
      id: 1,
      category: 'nature',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      title: 'Swiss Alps, Switzerland',
      description: 'Breathtaking views and perfect hiking trails. The cable car ride to the summit was incredible!',
      rating: 4.8,
      reviews: 127,
      coordinates: [46.5197, 7.4815],
      address: 'Швейцарські Альпи, Швейцарія',
      author: 'John Doe',
      authorId: 'john-doe',
      likes: 234,
      dislikes: 12,
      comments: 45,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      category: 'recreation',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=600&h=400&fit=crop',
      title: 'Maldives Beach Resort',
      description: 'Crystal clear waters and white sand beaches. Perfect for snorkeling and relaxation.',
      rating: 4.9,
      reviews: 89,
      coordinates: [3.2028, 73.2207],
      address: 'Мальдіви, Індійський океан',
      author: 'Jane Smith',
      authorId: 'jane-smith',
      likes: 456,
      dislikes: 8,
      comments: 67,
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      category: 'attraction',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop',
      title: 'Eiffel Tower, Paris',
      description: 'Iconic landmark with stunning city views. Best visited at sunset.',
      rating: 4.7,
      reviews: 2341,
      coordinates: [48.8584, 2.2945],
      address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Париж, Франція',
      author: 'Marie Dubois',
      authorId: 'marie-dubois',
      likes: 789,
      dislikes: 23,
      comments: 156,
      publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ];

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} год тому`;
    return `${Math.floor(diffInMinutes / 1440)} дн тому`;
  };

  const loadMorePosts = () => {
    setLoading(true);
    setTimeout(() => {
      const newPosts = mockPosts.map(post => ({
        ...post,
        id: post.id + page * 10,
        authorId: post.authorId || `user-${post.id + page * 10}`
      }));
      setPosts(prev => [...prev, ...newPosts]);
      setPage(prev => prev + 1);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    setPosts(mockPosts);
    setPage(2);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (!loading) {
          loadMorePosts();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const breadcrumbItems = [
    { label: t('header.home'), link: '/' },
    { label: t('header.discover') }
  ];

  return (
    <div className="discover-places">
      <div className="discover-container">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="categories-section">
          <div className="categories-scroll">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-emoji">{category.emoji}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="instagram-feed">
          {filteredPosts.map(post => (
            <div key={post.id} className="post-item">
              <div className="post-header">
                <Link to={`/profile/${post.authorId}`} className="post-author">
                  <div className="author-avatar">{post.author.charAt(0)}</div>
                  <div className="author-info">
                    <span className="author-name">{post.author}</span>
                    <span className="post-time">{getTimeAgo(post.publishedAt)}</span>
                  </div>
                </Link>
                <button className="post-menu" aria-label="Меню поста">⋯</button>
              </div>
              
              <div className="post-media">
                <img src={post.image} alt={post.title} className="post-image" />
              </div>
              
              <PostActions 
                initialLikes={post.likes}
                initialDislikes={post.dislikes}
                initialComments={[]}
              />
              
              <div className="post-content">
                <div className="post-title">
                  <strong>{post.title}</strong>
                </div>
                <div className="post-description">
                  {post.description}
                </div>
                <div className="post-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < Math.floor(post.rating) ? 'filled' : ''}`}>
                        ⭐
                      </span>
                    ))}
                    <span className="rating-text">{post.rating} ({post.reviews} відгуків)</span>
                  </div>
                </div>
                <div className="post-address">
                  <span className="address-icon">📍</span>
                  <span className="address-text">{post.address}</span>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Завантаження...</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DiscoverPlaces;