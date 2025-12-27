import { memo, useState, useCallback, useMemo } from 'react'
import { profileService } from '../services/profileService'
import './Wall.css'

const Wall = memo(({ userId, isOwnProfile, posts = [], user }) => {
  const [postText, setPostText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = useCallback(async () => {
    if (!postText.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      await profileService.createPost(postText.trim())
      setPostText('')
    } catch (err) {
      console.error('Failed to create post:', err)
      setError(err.message || 'Помилка створення посту')
    } finally {
      setIsSubmitting(false)
    }
  }, [postText, isSubmitting])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }, [handleSubmit])

  const handleLike = useCallback((postId) => {
    console.log('Like post:', postId)
    // TODO: Implement like functionality
  }, [])

  const handleComment = useCallback((postId) => {
    console.log('Comment on post:', postId)
    // TODO: Implement comment functionality
  }, [])

  const handleShare = useCallback((postId) => {
    console.log('Share post:', postId)
    // TODO: Implement share functionality
  }, [])

  const renderedPosts = useMemo(() => (
    posts.map(post => (
      <article key={post.id} className="wall__post">
        <div className="wall__post-avatar">
          <img 
            src={post.author?.avatar || '/default-avatar.svg'} 
            alt={post.author?.name || 'Аватар'}
            className="wall__post-avatar-img"
          />
        </div>
        
        <div className="wall__post-content">
          <div className="wall__post-header">
            <span className="wall__post-author">
              {post.author?.name || 'Невідомий користувач'}
            </span>
            <span className="wall__post-date">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Невідома дата'}
            </span>
          </div>
          
          <div className="wall__post-text">
            {post.content}
          </div>
          
          <div className="wall__post-actions">
            <button 
              className="wall__action-btn wall__action-btn--like"
              onClick={() => handleLike(post.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>{post.likes}</span>
            </button>
            
            <button 
              className="wall__action-btn wall__action-btn--comment"
              onClick={() => handleComment(post.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h11c.55 0 1-.45 1-1z"/>
              </svg>
              <span>{post.comments}</span>
            </button>
            
            <button 
              className="wall__action-btn wall__action-btn--share"
              onClick={() => handleShare(post.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              <span>{post.shares}</span>
            </button>
          </div>
        </div>
      </article>
    ))
  ), [posts, handleLike, handleComment, handleShare])

  return (
    <div className="wall">
      {isOwnProfile && (
        <div className="wall__composer">
          <div className="wall__composer-avatar">
            <img 
              src={user?.avatar || '/default-avatar.svg'} 
              alt={user?.name || 'Ваш аватар'}
              className="wall__composer-avatar-img"
            />
          </div>
          
          <div className="wall__composer-content">
            <textarea 
              placeholder="Що у вас нового?"
              className="wall__composer-textarea"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              rows={3}
            />
            
            {error && (
              <div className="wall__error">
                {error}
              </div>
            )}
            
            <div className="wall__composer-actions">
              <div className="wall__composer-tools">
                <button className="wall__composer-tool" title="Додати фото">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </button>
                
                <button className="wall__composer-tool" title="Додати емодзі">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </button>
              </div>
              
              <button 
                className="wall__composer-submit"
                onClick={handleSubmit}
                disabled={!postText.trim() || isSubmitting}
              >
                {isSubmitting ? 'Публікуємо...' : 'Опублікувати'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="wall__posts">
        {posts.length === 0 ? (
          <div className="wall__empty">
            <div className="wall__empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h11c.55 0 1-.45 1-1z"/>
              </svg>
            </div>
            <h3 className="wall__empty-title">Записів поки немає</h3>
            <p className="wall__empty-text">
              {isOwnProfile ? 'Поділіться своїми думками з друзями!' : 'Тут з\'являться записи користувача'}
            </p>
          </div>
        ) : (
          renderedPosts
        )}
      </div>
    </div>
  )
})

Wall.displayName = 'Wall'

export default Wall