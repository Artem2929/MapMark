import { memo, useState, useCallback, useEffect } from 'react'
import { postsService } from '../services/postsService'
import WallComposer from './WallComposer'
import WallPost from './WallPost'
import './Wall.css'

const Wall = memo(({ userId, isOwnProfile, user }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const loadPosts = async () => {
      if (!userId) return
      
      setLoading(true)
      setPage(1)
      try {
        const result = await postsService.getUserPosts(userId, 1, 10)
        if (result.status === 'success' && result.data) {
          const newPosts = result.data.posts || []
          setPosts(newPosts)
          setHasMore(newPosts.length === 10)
        }
      } catch (err) {
        console.error('Failed to load posts:', err)
        setError('Помилка завантаження постів')
      } finally {
        setLoading(false)
      }
    }
    
    loadPosts()
  }, [userId])

  useEffect(() => {
    if (!loading && posts.length > 0 && window.location.hash) {
      setTimeout(() => {
        const element = document.querySelector(window.location.hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.style.animation = 'highlight 2s ease-in-out'
        }
      }, 100)
    }
  }, [loading, posts])

  const handlePostCreated = useCallback(async (formData) => {
    try {
      const result = await postsService.createPost(formData)
      if (result.status === 'success' && result.data) {
        setPosts(prev => {
          const newPosts = [result.data, ...prev]
          return newPosts
        })
      }
    } catch (err) {
      console.error('Failed to create post:', err)
      throw err
    }
  }, [])

  const handleLike = useCallback(async (postId) => {
    try {
      const result = await postsService.likePost(postId)
      if (result.status === 'success' && result.data) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likesCount: result.data.likesCount, dislikesCount: result.data.dislikesCount, isLiked: result.data.liked, isDisliked: false }
            : post
        ))
      }
    } catch (err) {
      console.error('Failed to like post:', err)
    }
  }, [])

  const handleDislike = useCallback(async (postId) => {
    try {
      const result = await postsService.dislikePost(postId)
      if (result.status === 'success' && result.data) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likesCount: result.data.likesCount, dislikesCount: result.data.dislikesCount, isDisliked: result.data.disliked, isLiked: false }
            : post
        ))
      }
    } catch (err) {
      console.error('Failed to dislike post:', err)
    }
  }, [])

  const handleComment = useCallback(async (postId, content) => {
    try {
      const result = await postsService.addComment(postId, content)
      if (result.status === 'success' && result.data) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                commentsCount: (post.commentsCount || 0) + 1,
                comments: [...(post.comments || []), result.data]
              }
            : post
        ))
      }
    } catch (err) {
      console.error('Failed to add comment:', err)
    }
  }, [])

  const handleShare = useCallback(async (postId) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Поділитися постом',
          url: `${window.location.origin}/post/${postId}`
        })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
        alert('Посилання скопійовано!')
      }
    } catch (err) {
      console.error('Failed to share:', err)
    }
  }, [])

  const handleDelete = useCallback(async (postId) => {
    try {
      const result = await postsService.deletePost(postId)
      if (result.status === 'success') {
        setPosts(prev => prev.filter(post => post.id !== postId))
      }
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }, [])

  const handleUpdate = useCallback(async (postId, data) => {
    try {
      const result = await postsService.updatePost(postId, data)
      if (result.status === 'success' && result.data) {
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, ...result.data } : post
        ))
      }
    } catch (err) {
      console.error('Failed to update post:', err)
      throw err
    }
  }, [])

  const handleUpdateComment = useCallback(async (postId, commentId, content) => {
    try {
      const result = await postsService.updateComment(postId, commentId, content)
      if (result.status === 'success' && result.data) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id === commentId ? { ...comment, content: result.data.content } : comment
                )
              }
            : post
        ))
      }
    } catch (err) {
      console.error('Failed to update comment:', err)
      throw err
    }
  }, [])

  const handleDeleteComment = useCallback(async (postId, commentId) => {
    try {
      const result = await postsService.deleteComment(postId, commentId)
      if (result.status === 'success') {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? {
                ...post,
                comments: post.comments.filter(comment => comment.id !== commentId),
                commentsCount: Math.max(0, post.commentsCount - 1)
              }
            : post
        ))
      }
    } catch (err) {
      console.error('Failed to delete comment:', err)
      throw err
    }
  }, [])

  const handleLikeComment = useCallback(async (postId, commentId) => {
    try {
      const result = await postsService.likeComment(postId, commentId)
      if (result.status === 'success' && result.data) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id === commentId 
                    ? { ...comment, likesCount: result.data.likesCount, dislikesCount: result.data.dislikesCount, isLiked: result.data.liked, isDisliked: false }
                    : comment
                )
              }
            : post
        ))
      }
    } catch (err) {
      console.error('Failed to like comment:', err)
    }
  }, [])

  const handleDislikeComment = useCallback(async (postId, commentId) => {
    try {
      const result = await postsService.dislikeComment(postId, commentId)
      if (result.status === 'success' && result.data) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment.id === commentId 
                    ? { ...comment, likesCount: result.data.likesCount, dislikesCount: result.data.dislikesCount, isDisliked: result.data.disliked, isLiked: false }
                    : comment
                )
              }
            : post
        ))
      }
    } catch (err) {
      console.error('Failed to dislike comment:', err)
    }
  }, [])

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const result = await postsService.getUserPosts(userId, nextPage, 10)
      if (result.status === 'success' && result.data) {
        const newPosts = result.data.posts || []
        setPosts(prev => [...prev, ...newPosts])
        setPage(nextPage)
        setHasMore(newPosts.length === 10)
      }
    } catch (err) {
      console.error('Failed to load more posts:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [userId, page, loadingMore, hasMore])



  return (
    <div className="wall">
      {isOwnProfile && (
        <WallComposer 
          user={user}
          onPostCreated={handlePostCreated}
        />
      )}
      
      <div className="wall__posts">
        {loading ? (
          <div className="wall__loading">
            Завантаження постів...
          </div>
        ) : posts.length === 0 ? (
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
          <>
            {posts.map(post => (
              <WallPost
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={handleLike}
                onDislike={handleDislike}
                onComment={handleComment}
                onShare={handleShare}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
                onLikeComment={handleLikeComment}
                onDislikeComment={handleDislikeComment}
              />
            ))}
            
            {hasMore && (
              <button 
                className="wall__load-more"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Завантаження...' : 'Завантажити ще'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
})

Wall.displayName = 'Wall'

export default Wall