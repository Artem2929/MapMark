import { memo, useState, useCallback, useRef, useEffect } from 'react'
import './WallPost.css'

const WallPost = memo(({ post, currentUserId, onLike, onComment, onShare, onDelete, onUpdate, onUpdateComment, onDeleteComment }) => {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content || '')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const textareaRef = useRef(null)

  const isOwner = currentUserId === post.author?.id

  const handleCommentSubmit = useCallback(async () => {
    if (!commentText.trim() || isCommenting) return

    setIsCommenting(true)
    try {
      await onComment(post.id, commentText.trim())
      setCommentText('')
    } finally {
      setIsCommenting(false)
    }
  }, [commentText, isCommenting, onComment, post.id])

  const handleCommentKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleCommentSubmit()
    }
  }, [handleCommentSubmit])

  const handleEditSave = useCallback(async () => {
    if (editContent.trim() === post.content) {
      setIsEditing(false)
      return
    }
    
    try {
      await onUpdate(post.id, editContent.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update post:', error)
    }
  }, [editContent, post.content, post.id, onUpdate])

  const handleEditCancel = useCallback(() => {
    setEditContent(post.content || '')
    setIsEditing(false)
  }, [post.content])

  const handleCommentEdit = useCallback((commentId, content) => {
    setEditingCommentId(commentId)
    setEditCommentText(content)
  }, [])

  const handleCommentEditSave = useCallback(async (commentId) => {
    if (!editCommentText.trim()) return
    
    try {
      await onUpdateComment(post.id, commentId, editCommentText.trim())
      setEditingCommentId(null)
      setEditCommentText('')
    } catch (error) {
      console.error('Failed to update comment:', error)
    }
  }, [editCommentText, onUpdateComment, post.id])

  const handleCommentEditCancel = useCallback(() => {
    setEditingCommentId(null)
    setEditCommentText('')
  }, [])

  const handleCommentDelete = useCallback(async (commentId) => {
    if (!confirm('Видалити коментар?')) return
    
    try {
      await onDeleteComment(post.id, commentId)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }, [onDeleteComment, post.id])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [isEditing, editContent])

  const formatDate = (date) => {
    if (!date) return 'Невідома дата'
    
    const now = new Date()
    const postDate = new Date(date)
    const diffMs = now - postDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'щойно'
    if (diffMins < 60) return `${diffMins} хв`
    if (diffHours < 24) return `${diffHours} год`
    if (diffDays < 7) return `${diffDays} дн`
    
    return postDate.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <article className="wall-post">
      <div className="wall-post__avatar">
        <img 
          src={post.author?.avatar || '/default-avatar.svg'} 
          alt={post.author?.name || 'Аватар'}
          className="wall-post__avatar-img"
        />
      </div>
      
      <div className="wall-post__content">
        <div className="wall-post__header">
          <div className="wall-post__author-info">
            <span className="wall-post__author">
              {post.author?.name || 'Невідомий користувач'}
            </span>
            <span className="wall-post__date">
              {formatDate(post.createdAt)}
            </span>
          </div>
          
          {isOwner && (
            <div className="wall-post__menu">
              <button 
                className="wall-post__menu-btn"
                onClick={() => setIsEditing(true)}
                title="Редагувати"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
              
              <button 
                className="wall-post__menu-btn"
                onClick={() => onDelete(post.id)}
                title="Видалити"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {post.content && (
          <div className="wall-post__text">
            {isEditing ? (
              <div className="wall-post__edit">
                <textarea
                  ref={textareaRef}
                  className="wall-post__edit-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  maxLength={2000}
                />
                <div className="wall-post__edit-actions">
                  <button
                    className="btn secondary"
                    onClick={handleEditCancel}
                  >
                    Скасувати
                  </button>
                  <button
                    className="btn primary"
                    onClick={handleEditSave}
                    disabled={!editContent.trim()}
                  >
                    Зберегти
                  </button>
                </div>
              </div>
            ) : (
              post.content
            )}
          </div>
        )}
        
        {post.images && post.images.length > 0 && (
          <div className={`wall-post__images wall-post__images--${post.images.length}`}>
            {post.images.map((image, index) => (
              <div key={index} className="wall-post__image-wrapper">
                <img 
                  src={image}
                  alt={`Фото ${index + 1}`}
                  className="wall-post__image"
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="wall-post__actions">
          <button 
            className={`wall-post__action-btn wall-post__action-btn--like ${post.isLiked ? 'wall-post__action-btn--active' : ''}`}
            onClick={() => onLike(post.id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {post.likesCount > 0 && <span>{post.likesCount}</span>}
          </button>
          
          <button 
            className="wall-post__action-btn wall-post__action-btn--comment"
            onClick={() => setShowComments(!showComments)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
          </button>
          
          <button 
            className="wall-post__action-btn wall-post__action-btn--share"
            onClick={() => onShare(post.id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
        </div>
        
        {showComments && (
          <div className="wall-post__comments">
            {post.comments && post.comments.length > 0 && (
              <div className="wall-post__comments-list">
                {post.comments.map((comment) => {
                  const isCommentOwner = currentUserId === comment.user?.id
                  const isEditingThisComment = editingCommentId === comment.id
                  
                  return (
                    <div key={comment.id} className="wall-post__comment">
                      <img 
                        src={comment.user?.avatar || '/default-avatar.svg'} 
                        alt={comment.user?.name}
                        className="wall-post__comment-avatar"
                      />
                      <div className="wall-post__comment-content">
                        <div className="wall-post__comment-header">
                          <div className="wall-post__comment-info">
                            <span className="wall-post__comment-author">
                              {comment.user?.name || 'Невідомий'}
                            </span>
                            <span className="wall-post__comment-date">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          {isCommentOwner && (
                            <div className="wall-post__comment-menu">
                              <button
                                type="button"
                                className="wall-post__comment-menu-btn"
                                onClick={() => handleCommentEdit(comment.id, comment.content)}
                                title="Редагувати"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="wall-post__comment-menu-btn"
                                onClick={() => handleCommentDelete(comment.id)}
                                title="Видалити"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditingThisComment ? (
                          <div>
                            <textarea
                              className="wall-post__comment-edit-input"
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              maxLength={500}
                            />
                            <div className="wall-post__comment-edit-actions">
                              <button
                                type="button"
                                className="btn secondary"
                                onClick={handleCommentEditCancel}
                              >
                                Скасувати
                              </button>
                              <button
                                type="button"
                                className="btn primary"
                                onClick={() => handleCommentEditSave(comment.id)}
                                disabled={!editCommentText.trim()}
                              >
                                Зберегти
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="wall-post__comment-text">
                            {comment.content}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="wall-post__comment-form">
              <input
                type="text"
                placeholder="Напишіть коментар..."
                className="wall-post__comment-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                disabled={isCommenting}
                maxLength={500}
              />
              <button
                type="button"
                className="wall-post__comment-submit"
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || isCommenting}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L3 12h6v10h6V12h6z"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
})

WallPost.displayName = 'WallPost'

export default WallPost
