import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PhotoUploadModal from '../components/forms/PhotoUploadModal'
import { photosService } from '../features/profile/services/photosService'
import './PhotosPage.css'

const Photos = () => {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ description: '', location: '', hashtags: '' })
  const navigate = useNavigate()
  const { userId } = useParams()

  const handleEditPhoto = () => {
    setEditData({
      description: selectedPhoto.description || '',
      location: selectedPhoto.location || '',
      hashtags: selectedPhoto.hashtags || ''
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({ description: '', location: '', hashtags: '' })
  }

  const handleSaveEdit = async () => {
    await photosService.updatePhoto(selectedPhoto._id, editData)
    await loadPhotos(userId)
    const updatedPhotos = await photosService.getUserPhotos(userId)
    const updatedPhoto = updatedPhotos.find(p => p._id === selectedPhoto._id)
    if (updatedPhoto) {
      setSelectedPhoto(updatedPhoto)
    }
    setIsEditing(false)
  }

  const handleAddHashtag = (tag) => {
    const currentTags = editData.hashtags.split(' ').filter(t => t.trim())
    if (currentTags.length < 5 && !editData.hashtags.includes(tag)) {
      const newTags = editData.hashtags ? `${editData.hashtags} ${tag}` : tag
      setEditData({ ...editData, hashtags: newTags.substring(0, 200) })
    }
  }

  const handleTextareaChange = (e, field) => {
    const textarea = e.target
    const value = e.target.value
    
    if (field === 'hashtags') {
      const hashtags = value.split(' ').filter(tag => tag.trim())
      if (hashtags.length > 5) return
    }
    
    setEditData({ ...editData, [field]: value })
    
    const lines = value.split('\n').length
    const wrappedLines = Math.ceil(value.length / 50)
    const totalLines = Math.max(lines, wrappedLines)
    
    if (totalLines > 1) {
      textarea.style.height = '80px'
      textarea.style.overflowY = 'auto'
      textarea.style.paddingRight = '12px'
    } else {
      textarea.style.height = '48px'
      textarea.style.overflowY = 'hidden'
      textarea.style.paddingRight = '16px'
    }
  }

  useEffect(() => {
    const initializePhotos = async () => {
      setLoading(true)

      const authToken = localStorage.getItem('accessToken')
      if (!authToken) {
        navigate('/login')
        return
      }

      let targetUserId = userId
      const token = localStorage.getItem('accessToken')
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const tokenUserId = payload.id
        setCurrentUserId(tokenUserId)

        if (!targetUserId) {
          targetUserId = tokenUserId
          navigate(`/photos/${targetUserId}`, { replace: true })
          return
        }
      }

      await loadPhotos(targetUserId)
      setLoading(false)
    }

    initializePhotos()
  }, [userId, navigate])

  const loadPhotos = async (targetUserId) => {
    const userPhotos = await photosService.getUserPhotos(targetUserId)
    setPhotos(userPhotos)
  }

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo)
    loadComments(photo._id)
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
    setComments([])
    setNewComment('')
    setIsEditing(false)
    setEditData({ description: '', location: '', hashtags: '' })
  }

  const loadComments = async (photoId) => {
    setLoadingComments(true)
    const response = await photosService.getPhotoComments(photoId)
    setComments(response?.data?.comments || response?.comments || [])
    setLoadingComments(false)
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const response = await photosService.addPhotoComment(selectedPhoto._id, newComment.trim())
    setComments(prev => [response.data.comment, ...prev])
    setNewComment('')
  }

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id)
    setEditingCommentText(comment.text)
  }

  const handleSaveComment = async (commentId) => {
    if (!editingCommentText.trim()) return
    
    const response = await photosService.updatePhotoComment(selectedPhoto._id, commentId, editingCommentText.trim())
    setComments(prev => prev.map(c => c._id === commentId ? response.data.comment : c))
    setEditingCommentId(null)
    setEditingCommentText('')
  }

  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentText('')
  }

  const handleDeleteComment = async (commentId) => {
    await photosService.deletePhotoComment(selectedPhoto._id, commentId)
    setComments(prev => prev.filter(c => c._id !== commentId))
  }

  const handleOpenUpload = () => {
    setShowUploadModal(true)
  }

  const handleCloseUpload = () => {
    setShowUploadModal(false)
  }


  const handleUploadSubmit = async (formData) => {
    await photosService.uploadPhotos(formData)
    await loadPhotos(userId)
    handleCloseUpload()
  }

  const handleDeletePhoto = async (photoId, e) => {
    e.stopPropagation()
    await photosService.deletePhoto(photoId)
    await loadPhotos(userId)
  }

  const handleToggleLike = async (photoId, type, e) => {
    e.stopPropagation()
    await photosService.togglePhotoLike(photoId, type)
    await loadPhotos(userId)

    if (selectedPhoto && selectedPhoto._id === photoId) {
      const updatedPhotos = await photosService.getUserPhotos(userId)
      const updatedPhoto = updatedPhotos.find(p => p._id === photoId)
      if (updatedPhoto) {
        setSelectedPhoto(updatedPhoto)
      }
    }
  }

  if (loading) {
    return (
      <div className="photos-page">
        <div className="loading">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="photos-page">
      <nav className="breadcrumbs">
        <span className="breadcrumb-item">
          <a className="breadcrumb-link" href={`/profile/${userId}`}>Профіль</a>
        </span>
        <span className="breadcrumb-item">
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Фото</span>
        </span>
      </nav>

      <div className="photos-header">
        <h1>Мої фото</h1>
      </div>

      <div className="photos-grid">
        {currentUserId === userId && (
          <div className="add-photo-card">
            <button className="add-photo-grid-btn" onClick={handleOpenUpload}>
              <span>+</span>
              <span>Додати фото</span>
            </button>
          </div>
        )}
        {photos.map((photo) => (
          <div
            key={photo._id}
            className="photo-card"
            onClick={() => handlePhotoClick(photo)}
          >
            <div className="photo-image">
              <img
                src={`data:${photo.mimeType};base64,${photo.data}`}
                alt={photo.description || 'Фото'}
                loading="lazy"
              />
              {currentUserId === userId && (
                <button
                  className="photo-delete-btn"
                  onClick={(e) => handleDeletePhoto(photo._id, e)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
              <div className="photo-actions">
                <button
                  className={`photo-like-btn ${photo.userReaction === 'like' ? 'active' : ''}`}
                  onClick={(e) => handleToggleLike(photo._id, 'like', e)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                  </svg>
                  <span>{photo.likes || 0}</span>
                </button>
                <button
                  className={`photo-dislike-btn ${photo.userReaction === 'dislike' ? 'active' : ''}`}
                  onClick={(e) => handleToggleLike(photo._id, 'dislike', e)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                  </svg>
                  <span>{photo.dislikes || 0}</span>
                </button>
                <button
                  className="photo-comment-btn"
                  onClick={(e) => { e.stopPropagation() }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && currentUserId !== userId && (
        <div className="empty-state">
          <p>У користувача поки немає фото</p>
        </div>
      )}

      {selectedPhoto && (
        <div className="photo-modal" onClick={handleCloseModal}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={handleCloseModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>

            <div className="photo-modal-image">
              <img
                src={`data:${selectedPhoto.mimeType};base64,${selectedPhoto.data}`}
                alt={selectedPhoto.description || 'Фото'}
              />
              <div className="photo-actions">
                <button
                  className={`photo-like-btn ${selectedPhoto.userReaction === 'like' ? 'active' : ''}`}
                  onClick={() => handleToggleLike(selectedPhoto._id, 'like', { stopPropagation: () => {} })}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                  </svg>
                  <span>{selectedPhoto.likes || 0}</span>
                </button>
                <button
                  className={`photo-dislike-btn ${selectedPhoto.userReaction === 'dislike' ? 'active' : ''}`}
                  onClick={() => handleToggleLike(selectedPhoto._id, 'dislike', { stopPropagation: () => {} })}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                  </svg>
                  <span>{selectedPhoto.dislikes || 0}</span>
                </button>
                <button className="photo-comment-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="photo-modal-sidebar">
              <div className="photo-modal-header">
                <div className="photo-modal-user">
                  <div className="photo-modal-avatar">
                    {selectedPhoto.user?.avatar ? (
                      <img
                        src={selectedPhoto.user.avatar.startsWith('data:') ? selectedPhoto.user.avatar : `data:image/jpeg;base64,${selectedPhoto.user.avatar}`}
                        alt={selectedPhoto.user.name}
                        className="photo-modal-avatar-img"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.textContent = selectedPhoto.user?.name?.[0] || 'U'
                        }}
                      />
                    ) : (
                      selectedPhoto.user?.name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="photo-modal-user-info">
                    <h4>{selectedPhoto.user?.name || 'Користувач'}</h4>
                    <div className="photo-modal-date">
                      {new Date(selectedPhoto.createdAt).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                </div>
                {currentUserId === userId && !isEditing && (
                  <button className="photo-edit-btn" onClick={handleEditPhoto}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                )}
              </div>

              <div className="photo-info">
                {isEditing ? (
                  <div className="photo-upload-form">
                    <div className="profile-edit-form__field">
                      <label className="profile-edit-form__label">Опис</label>
                      <textarea
                        className="profile-edit-form__textarea"
                        placeholder="Розкажіть про фото"
                        rows="1"
                        maxLength="500"
                        value={editData.description}
                        onChange={(e) => handleTextareaChange(e, 'description')}
                        aria-describedby="desc-count"
                      />
                      <div id="desc-count" className="profile-edit-form__char-count">
                        {editData.description.length}/500
                      </div>
                    </div>
                    <div className="profile-edit-form__field">
                      <label className="profile-edit-form__label">Місцезнаходження</label>
                      <input
                        type="text"
                        className="profile-edit-form__input"
                        placeholder="Місто, країна"
                        maxLength="100"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        aria-describedby="loc-count"
                      />
                      <div id="loc-count" className="profile-edit-form__char-count">
                        {editData.location.length}/100
                      </div>
                    </div>
                    <div className="profile-edit-form__field">
                      <label className="profile-edit-form__label">Хештеги</label>
                      <textarea
                        className="profile-edit-form__textarea"
                        placeholder="#природа #подорож #фото"
                        maxLength="200"
                        rows="1"
                        value={editData.hashtags}
                        onChange={(e) => handleTextareaChange(e, 'hashtags')}
                        aria-describedby="hash-count"
                      />
                      <div id="hash-count" className="profile-edit-form__char-count" style={{ color: editData.hashtags.split(' ').filter(t => t.startsWith('#')).length >= 5 ? '#dc2626' : '#6b7280' }}>
                        {editData.hashtags.split(' ').filter(t => t.startsWith('#')).length}/5
                      </div>
                      <div className="hashtag-suggestions">
                        {['#природа', '#подорож', '#фото', '#україна', '#життя', '#друзі', '#сім\'я', '#відпочинок']
                          .filter(tag => !editData.hashtags.includes(tag))
                          .map(tag => (
                            <button key={tag} type="button" className="hashtag-suggestion" onClick={() => handleAddHashtag(tag)}>{tag}</button>
                          ))}
                      </div>
                    </div>
                    <div className="photo-edit-actions">
                      <button className="btn secondary" onClick={handleCancelEdit}>Скасувати</button>
                      <button className="btn primary" onClick={handleSaveEdit}>Зберегти</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedPhoto.description && (
                      <div className="photo-info-item">
                        <span className="photo-info-label">Опис:</span>
                        {selectedPhoto.description}
                        {currentUserId === userId && (
                          <button className="photo-edit-btn" onClick={handleEditPhoto}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                    {selectedPhoto.location && (
                      <div className="photo-info-item">
                        <span className="photo-info-label">Місце:</span>
                        {selectedPhoto.location}
                      </div>
                    )}
                    {selectedPhoto.hashtags && (
                      <div className="photo-info-item">
                        <span className="photo-info-label">Хештеги:</span>
                        <span className="photo-hashtags">{selectedPhoto.hashtags}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="photo-modal-comments">
                <div className="comments-list">
                  {loadingComments ? (
                    <div className="comments-empty">Завантаження...</div>
                  ) : comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment._id} className="comment-item">
                        <div className="comment-avatar">
                          {comment.user?.name?.[0] || 'U'}
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="username">{comment.user?.name || 'Користувач'}</span>
                            <span className="comment-date">
                              {new Date(comment.createdAt).toLocaleDateString('uk-UA')}
                            </span>
                            {comment.user?.id === currentUserId && (
                              <div className="comment-actions">
                                <button onClick={() => handleEditComment(comment)} className="comment-action-btn">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                  </svg>
                                </button>
                                <button onClick={() => handleDeleteComment(comment._id)} className="comment-action-btn">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          {editingCommentId === comment._id ? (
                            <div className="comment-edit-form">
                              <textarea
                                className="comment-edit-input"
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                maxLength="1000"
                                rows="2"
                              />
                              <div className="comment-edit-actions">
                                <button onClick={handleCancelEditComment} className="btn secondary">Скасувати</button>
                                <button onClick={() => handleSaveComment(comment._id)} className="btn primary">Зберегти</button>
                              </div>
                            </div>
                          ) : (
                            <div className="comment-text">
                              {comment.text}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="comments-empty">Коментарів немає</div>
                  )}
                </div>
                <form className="comment-form" onSubmit={handleAddComment}>
                  <textarea
                    className="comment-input"
                    placeholder="Додати коментар..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength="1000"
                    rows="1"
                  />
                  <button
                    type="submit"
                    className="comment-submit"
                    disabled={!newComment.trim()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L3 12h6v10h6V12h6z"/>
                    </svg>
                  </button>
                  <div className="comment-char-count">
                    {newComment.length}/1000
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <PhotoUploadModal
          onClose={handleCloseUpload}
          onUpload={handleUploadSubmit}
        />
      )}
    </div>
  )
}

export default Photos