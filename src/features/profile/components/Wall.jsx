import React, { memo, useState, useCallback, useMemo } from 'react'
import './Wall.css'

const Wall = memo(({ userId, isOwnProfile, posts = [] }) => {
  const [postText, setPostText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!postText.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      // TODO: Implement post creation API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setPostText('')
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [postText, isSubmitting])

  const renderedPosts = useMemo(() => (
    posts.map(post => (
      <div key={post.id} className="wall__post">
        {post.content}
      </div>
    ))
  ), [posts])

  return (
    <div className="wall-container">
      <h3 className="wall__title">Стіна</h3>
      {isOwnProfile && (
        <div className="wall__post-form">
          <textarea 
            placeholder="Що у вас нового?"
            className="wall__textarea"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            disabled={isSubmitting}
          />
          <button 
            className="wall__submit-btn"
            onClick={handleSubmit}
            disabled={!postText.trim() || isSubmitting}
          >
            {isSubmitting ? 'Публікуємо...' : 'Опублікувати'}
          </button>
        </div>
      )}
      {posts.length === 0 ? (
        <p className="wall__empty">
          Записів поки немає
        </p>
      ) : (
        <div className="wall__posts">
          {renderedPosts}
        </div>
      )}
    </div>
  )
})

export default Wall