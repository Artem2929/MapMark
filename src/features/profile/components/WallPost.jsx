import { memo, useState, useCallback, useRef, useEffect } from 'react'
import DeleteConfirmModal from '../../../components/forms/DeleteConfirmModal'
import EmojiPicker from './EmojiPicker'
import './WallPost.css'

const WallPost = memo(({ post, currentUserId, onLike, onDislike, onComment, onShare, onDelete, onUpdate, onUpdateComment, onDeleteComment, onLikeComment, onDislikeComment }) => {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const commentTextareaRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content || '')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [editImages, setEditImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

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

  const handleCommentChange = useCallback((e) => {
    setCommentText(e.target.value)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [])

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
    setEditImages([])
    setNewImages([])
    setShowEmojiPicker(false)
    setIsEditing(false)
  }, [post.content])

  const handleCommentEdit = useCallback((commentId, content) => {
    setEditingCommentId(commentId)
    setEditCommentText(content)
    setTimeout(() => {
      const textarea = document.querySelector('.wall-post__comment-edit-input')
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, 0)
  }, [])

  const handleEmojiSelect = useCallback((emoji) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = editContent.slice(0, start) + emoji + editContent.slice(end)
    
    if (newContent.length <= 2000) {
      setEditContent(newContent)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    }
  }, [editContent])

  const handleImageSelect = useCallback((e) => {
    const files = Array.from(e.target.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (editImages.length + newImages.length + imageFiles.length > 2) {
      return
    }

    const images = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36)
    }))

    setNewImages(prev => [...prev, ...images])
  }, [editImages, newImages])

  const handleRemoveExistingImage = useCallback((index) => {
    setEditImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleRemoveNewImage = useCallback((imageId) => {
    setNewImages(prev => {
      const updated = prev.filter(img => img.id !== imageId)
      const removed = prev.find(img => img.id === imageId)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
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
    try {
      await onDeleteComment(post.id, commentId)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }, [onDeleteComment, post.id])

  const handleDeleteClick = useCallback(() => {
    setShowDeleteModal(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    setShowDeleteModal(false)
    await onDelete(post.id)
  }, [onDelete, post.id])

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false)
  }, [])

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
                className={`wall-post__menu-btn ${isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(true)}
                title="Редагувати"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
              
              <button 
                className="wall-post__menu-btn"
                onClick={handleDeleteClick}
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
                  <div className="wall-post__edit-emoji-wrapper">
                    <button
                      type="button"
                      className="wall-post__edit-emoji-btn"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      title="Додати емодзі"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                        <line x1="9" y1="9" x2="9.01" y2="9"/>
                        <line x1="15" y1="9" x2="15.01" y2="9"/>
                      </svg>
                    </button>
                    {showEmojiPicker && (
                      <EmojiPicker 
                        onSelect={handleEmojiSelect}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    )}
                  </div>
                  <div className="wall-post__edit-buttons">
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
            className={`wall-post__action-btn wall-post__action-btn--like ${post.isLiked ? 'wall-post__action-btn--active' : ''} ${(post.likesCount || 0) > (post.dislikesCount || 0) && (post.likesCount || 0) > 0 ? 'wall-post__action-btn--winning' : ''}`}
            onClick={() => onLike(post.id)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
            </svg>
            <span>{post.likesCount || 0}</span>
          </button>
          
          <button 
            className={`wall-post__action-btn wall-post__action-btn--dislike ${post.isDisliked ? 'wall-post__action-btn--active' : ''} ${(post.dislikesCount || 0) > (post.likesCount || 0) && (post.dislikesCount || 0) > 0 ? 'wall-post__action-btn--winning' : ''}`}
            onClick={() => onDislike(post.id)}
            title="Дизлайк"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
            </svg>
            <span>{post.dislikesCount || 0}</span>
          </button>
          
          <button 
            className={`wall-post__action-btn wall-post__action-btn--comment ${(post.commentsCount || 0) > 0 ? 'wall-post__action-btn--has-comments' : ''}`}
            onClick={() => setShowComments(!showComments)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
            </svg>
            <span>{post.commentsCount || 0}</span>
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
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="wall-post__comment-menu-btn"
                                onClick={() => handleCommentDelete(comment.id)}
                                title="Видалити"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                          <>
                            <div className="wall-post__comment-text">
                              {comment.content}
                            </div>
                            <div className="comment-reactions">
                              <button
                                type="button"
                                className={`comment-like-btn ${comment.isLiked ? 'active' : ''} ${(comment.likesCount || 0) > (comment.dislikesCount || 0) && (comment.likesCount || 0) > 0 ? 'winning' : ''}`}
                                onClick={() => onLikeComment(post.id, comment.id)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                                </svg>
                                <span>{comment.likesCount || 0}</span>
                              </button>
                              <button
                                type="button"
                                className={`comment-dislike-btn ${comment.isDisliked ? 'active' : ''} ${(comment.dislikesCount || 0) > (comment.likesCount || 0) && (comment.dislikesCount || 0) > 0 ? 'winning' : ''}`}
                                onClick={() => onDislikeComment(post.id, comment.id)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                                </svg>
                                <span>{comment.dislikesCount || 0}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="wall-post__comment-form">
              <textarea
                ref={commentTextareaRef}
                placeholder="Напишіть коментар..."
                className="wall-post__comment-input"
                value={commentText}
                onChange={handleCommentChange}
                disabled={isCommenting}
                maxLength={500}
                rows={1}
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
      
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Видалення поста"
          message="Ви дійсно бажаєте видалити даний пост?"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </article>
  )
})

WallPost.displayName = 'WallPost'

export default WallPost
