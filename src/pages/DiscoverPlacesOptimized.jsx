import React, { useState, useEffect } from 'react';
import { Hero, Section, Container, Grid, PostCard, Button } from '../components/ui';
import './DiscoverPlacesOptimized.css';

const DiscoverPlaces = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Всі', emoji: '🌍' },
    { id: 'restaurants', name: 'Ресторани', emoji: '🍽️' },
    { id: 'attractions', name: 'Пам\'ятки', emoji: '🏛️' },
    { id: 'nature', name: 'Природа', emoji: '🌲' },
    { id: 'shopping', name: 'Шопінг', emoji: '🛍️' },
    { id: 'nightlife', name: 'Нічне життя', emoji: '🌃' }
  ];

  const mockPosts = [
    {
      id: 1,
      author: { name: 'John Doe', avatar: null },
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      title: 'Amazing Swiss Alps',
      description: 'Breathtaking views and perfect hiking trails',
      rating: 4.8,
      address: 'Zermatt, Switzerland',
      time: '2 години тому',
      likes: 234,
      comments: 45,
      category: 'nature'
    },
    {
      id: 2,
      author: { name: 'Jane Smith', avatar: null },
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop',
      title: 'Parisian Café Culture',
      description: 'Best coffee and croissants in the city',
      rating: 4.6,
      address: 'Paris, France',
      time: '4 години тому',
      likes: 189,
      comments: 32,
      category: 'restaurants'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handlePostAction = (action, postId) => {
    console.log(`${action} on post ${postId}`);
  };

  if (loading) {
    return (
      <div className="discover-places">
        <Container>
          <div className="loading-state">
            <div className="spinner">⏳</div>
            <p>Завантаження місць...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="discover-places">
      <Hero
        title="Відкрийте нові місця"
        subtitle="Досліджуйте найкращі локації від нашої спільноти мандрівників"
        variant="simple"
      />

      {/* Categories */}
      <Section spacing="small" background="transparent">
        <div className="categories-scroll">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'secondary'}
              size="medium"
              className="category-btn"
              onClick={() => handleCategoryChange(category.id)}
            >
              <span className="category-emoji">{category.emoji}</span>
              <span className="category-name">{category.name}</span>
            </Button>
          ))}
        </div>
      </Section>

      {/* Posts Feed */}
      <Section spacing="medium" background="transparent">
        <Container size="small">
          <div className="posts-feed">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onAuthorClick={(author) => console.log('Author clicked:', author)}
                onLike={() => handlePostAction('like', post.id)}
                onDislike={() => handlePostAction('dislike', post.id)}
                onComment={() => handlePostAction('comment', post.id)}
                onBookmark={() => handlePostAction('bookmark', post.id)}
              />
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="empty-state">
              <div>🔍</div>
              <h3>Нічого не знайдено</h3>
              <p>Спробуйте вибрати іншу категорію</p>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};

export default DiscoverPlaces;