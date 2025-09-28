import React, { useState, useEffect } from 'react';
import PostCreator from './PostCreator';
import Post from './Post';
import wallService from '../../services/wallService';
import './Wall.css';

const Wall = ({ userId, isOwnProfile }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load posts from API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const userPosts = await wallService.getUserPosts(userId);
        setPosts(userPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [userId]);

  const handleCreatePost = async (postData) => {
    try {
      setLoading(true);
      const newPost = await wallService.createPost({
        ...postData,
        authorId: userId
      });
      
      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      await wallService.addReaction(postId, currentUserId, reactionType);
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const newReactions = { ...post.reactions };
          
          if (post.userReaction) {
            newReactions[post.userReaction]--;
          }
          
          const newUserReaction = post.userReaction === reactionType ? null : reactionType;
          if (newUserReaction) {
            newReactions[newUserReaction]++;
          }
          
          return {
            ...post,
            reactions: newReactions,
            userReaction: newUserReaction,
            likes: Object.values(newReactions).reduce((sum, count) => sum + count, 0),
            likedByUser: newUserReaction === 'like'
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleShare = async (postId) => {
    try {
      await wallService.sharePost(postId);
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            shares: post.shares + 1
          };
        }
        return post;
      }));
      
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleComment = async (postId, commentData) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const newComment = await wallService.addComment(postId, commentData.content, currentUserId);
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReply = async (postId, commentId, replyData) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const updatedComment = await wallService.addReply(postId, commentId, replyData.content, currentUserId);
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map(comment => 
              comment.id === commentId ? updatedComment : comment
            )
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  return (
    <div className="wall-container">
      <div className="wall-header">
        <h3>Стіна</h3>
        <span className="posts-count">{posts.length} записів</span>
      </div>

      {isOwnProfile && (
        <PostCreator onCreatePost={handleCreatePost} />
      )}

      <div className="posts-list">
        {posts.map(post => (
          <Post
            key={post.id}
            post={post}
            onReaction={handleReaction}
            onShare={handleShare}
            onComment={handleComment}
            onReply={handleReply}
            canComment={true}
          />
        ))}
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Завантаження...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="empty-wall">
          <div className="empty-icon">📝</div>
          <p>Поки що записів немає</p>
          {isOwnProfile && <p>Створіть свій перший запис!</p>}
        </div>
      )}
    </div>
  );
};

export default Wall;