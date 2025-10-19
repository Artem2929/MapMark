import React, { useState } from 'react';
import './Wall.css';

const Wall = ({ userId, isOwnProfile }) => {
  const [postText, setPostText] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Артем',
      date: '19 жовтня о 15:30',
      content: 'Перша публікація на моїй новій стіні 😎',
      images: ['https://picsum.photos/400/250?random=1'],
      likes: 24,
      comments: 3,
      liked: false
    },
    {
      id: 2,
      author: 'Артем',
      date: '18 жовтня о 12:15',
      content: 'Чудовий день для прогулянки містом! 🌞',
      images: [
        'https://picsum.photos/400/250?random=2',
        'https://picsum.photos/400/250?random=3',
        'https://picsum.photos/400/250?random=4'
      ],
      likes: 12,
      comments: 1,
      liked: true
    }
  ]);

  const handleTextChange = (e) => {
    setPostText(e.target.value);
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const photoUrls = files.map(file => URL.createObjectURL(file));
    setSelectedPhotos(photoUrls);
  };

  const handleCancel = () => {
    setPostText('');
    setSelectedPhotos([]);
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newPost = {
      id: Date.now(),
      author: 'Артем',
      date: new Date().toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      }),
      content: postText,
      images: selectedPhotos.length > 0 ? selectedPhotos : [],
      likes: 0,
      comments: 0,
      liked: false
    };

    setPosts([newPost, ...posts]);
    handleCancel();
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  return (
    <div className="wall-container">
      <div className="wall-header">
        <h3>Стіна</h3>
        <span className="posts-count">{posts.length} записи</span>
      </div>

      {isOwnProfile && (
        <div className="post-creator">
          <form onSubmit={handlePublish}>
            <div className="creator-header">
              <div className="creator-avatar">А</div>
              <textarea
                value={postText}
                onChange={handleTextChange}
                placeholder="Що у вас нового?"
                className="creator-input"
                rows="2"
              />
            </div>

            <div className="creator-actions">
              <div className="creator-tools">
                <label className="tool-btn" title="Додати фото">
                  📷
                  <input
                    accept="image/*"
                    multiple
                    type="file"
                    hidden
                    onChange={handlePhotoSelect}
                  />
                </label>
                <button type="button" className="tool-btn" title="Емоджі">😊</button>
              </div>
              <div className="creator-buttons">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={handleCancel}
                >
                  Скасувати
                </button>
                <button 
                  type="submit" 
                  className="publish-btn" 
                  disabled={!postText.trim()}
                >
                  Опублікувати
                </button>
              </div>
            </div>

            {selectedPhotos.length > 0 && (
              <div className="photo-preview">
                {selectedPhotos.map((photo, index) => (
                  <img key={index} src={photo} alt={`Preview ${index + 1}`} />
                ))}
              </div>
            )}
          </form>
        </div>
      )}

      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className="post">
            <div className="post-header">
              <div className="post-avatar">А</div>
              <div className="post-meta">
                <div className="post-author">{post.author}</div>
                <div className="post-date">{post.date}</div>
              </div>
            </div>
            <div className="post-content">
              <p>{post.content}</p>
              {post.images && post.images.length > 0 && (
                <div className={`post-photos ${
                  post.images.length === 1 ? 'single' :
                  post.images.length === 2 ? 'double' : 'triple'
                }`}>
                  {post.images.map((image, index) => (
                    <img key={index} src={image} alt={`Фото ${index + 1}`} />
                  ))}
                </div>
              )}
            </div>
            <div className="post-actions">
              <button 
                className={`like-btn ${post.liked ? 'liked' : ''}`}
                onClick={() => handleLike(post.id)}
              >
                ❤️ {post.likes}
              </button>
              <button className="comment-btn">💬 {post.comments}</button>
              <button className="share-btn">↗️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wall;