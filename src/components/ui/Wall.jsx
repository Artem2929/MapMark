import React, { useState, useRef, useEffect } from 'react';
import { wallService } from '../../services/wallService';
import './Wall.css';

const Wall = ({ userId, isOwnProfile, user }) => {
  const [loading, setLoading] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState('');
  const [showPostMenu, setShowPostMenu] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const textareaRef = useRef(null);
  
  const mockUsers = [
    { id: 1, name: 'Артем Поліщук', username: 'artem' },
    { id: 2, name: 'Марія Іванова', username: 'maria' },
    { id: 3, name: 'Олексій Петров', username: 'alex' },
    { id: 4, name: 'Анна Сидорова', username: 'anna' },
    { id: 5, name: 'Дмитро Коваль', username: 'dmitro' }
  ];
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (userId) {
      loadPosts();
    }
  }, [userId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const posts = await wallService.getPosts(userId);
      setPosts(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setPostText(value);
    
    // Перевіряємо чи є @ перед курсором
    const textBeforeCursor = value.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const searchTerm = textBeforeCursor.slice(atIndex + 1);
      if (searchTerm.length >= 0 && !searchTerm.includes(' ')) {
        const filtered = mockUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setUserSuggestions(filtered);
        setShowUserSuggestions(filtered.length > 0);
        setSelectedSuggestionIndex(0);
      } else {
        setShowUserSuggestions(false);
      }
    } else {
      setShowUserSuggestions(false);
    }
  };

  // Авто-розширення textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [postText]);

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = postText.slice(0, start) + emoji + postText.slice(end);
    setPostText(newText);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };
  
  const handleUserSelect = (user) => {
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = postText.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const newText = postText.slice(0, atIndex) + `@${user.username} ` + postText.slice(cursorPos);
      setPostText(newText);
      setShowUserSuggestions(false);
      
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = atIndex + user.username.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };
  
  const handleKeyDown = (e) => {
    if (showUserSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < userSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : userSuggestions.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleUserSelect(userSuggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowUserSuggestions(false);
      }
    }
  };
  
  const renderPostContent = (content) => {
    return content.replace(/@(\w+)/g, '<span class="user-tag">@$1</span>');
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const photoUrls = files.map(file => URL.createObjectURL(file));
    setSelectedPhotos(photoUrls);
  };
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    setSelectedFiles(fileData);
  };
  
  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📄';
    if (type.includes('excel') || type.includes('sheet')) return '📈';
    if (type.includes('zip') || type.includes('rar')) return '🗄';
    return '📁';
  };

  const handleCancel = () => {
    setPostText('');
    setSelectedPhotos([]);
    setSelectedFiles([]);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!postText.trim() || !userId) return;

    try {
      setLoading(true);
      const postData = {
        content: postText,
        images: selectedPhotos,
        files: selectedFiles
      };
      
      const result = await wallService.createPost(userId, postData);
      if (result.success) {
        await loadPosts();
        handleCancel();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const result = await wallService.toggleLike(postId, currentUserId);
      if (result.success) {
        await loadPosts();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const handleDislike = async (postId) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const result = await wallService.toggleDislike(postId, currentUserId);
      if (result.success) {
        await loadPosts();
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
    }
  };
  
  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setEditText(post.content);
    setShowPostMenu(null);
  };
  
  const handleSaveEdit = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, content: editText } : post
    ));
    setEditingPost(null);
    setEditText('');
  };
  
  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditText('');
  };
  
  const handleDeletePost = async (postId) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      const result = await wallService.deletePost(postId, currentUserId);
      if (result.success) {
        await loadPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
    setShowPostMenu(null);
  };
  
  const handleHidePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, hidden: true } : post
    ));
    setShowPostMenu(null);
  };
  
  const handleReportPost = (postId) => {
    alert('Скаргу надіслано');
    setShowPostMenu(null);
  };
  
  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };
  
  const handleCommentSubmit = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    
    try {
      const currentUserId = localStorage.getItem('userId');
      const result = await wallService.addComment(postId, currentUserId, text);
      if (result.success) {
        await loadPosts();
        setCommentText(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
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
              <div className="creator-avatar">
                {user?.avatar ? (
                  <img 
                    src={user.avatar.startsWith('data:') || user.avatar.startsWith('http') 
                      ? user.avatar 
                      : `http://localhost:3000${user.avatar}`} 
                    alt="Аватар" 
                  />
                ) : (
                  <div className="avatar-placeholder">{user?.name?.charAt(0) || 'U'}</div>
                )}
              </div>
              <div className="input-container">
                <textarea
                  ref={textareaRef}
                  value={postText}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Що у вас нового?"
                  className="creator-input"
                  rows="2"
                />
                <div 
                  id="tag-suggestions" 
                  className="user-suggestions"
                  style={{ display: showUserSuggestions ? 'block' : 'none' }}
                >
                  {userSuggestions.map((user, index) => (
                    <div
                      key={user.id}
                      className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="suggestion-avatar">{user.name[0]}</div>
                      <div className="suggestion-info">
                        <div className="suggestion-name">{user.name}</div>
                        <div className="suggestion-username">@{user.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <span className={`char-counter ${
                  postText.length > 1500 ? 'error' : 
                  postText.length > 1200 ? 'warning' : ''
                }`}>
                  {postText.length}/1500
                </span>
              </div>
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

                <button 
                  type="button" 
                  className="tool-btn" 
                  title="Емоджі"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😊
                </button>
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
                  disabled={!postText.trim() || postText.length > 1500}
                >
                  Опублікувати
                </button>
              </div>
            </div>

            {showEmojiPicker && (
              <div className="emoji-picker">
                {[
                  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
                  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
                  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
                  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
                  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
                  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
                  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
                  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
                  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
                  '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
                  '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
                  '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️',
                  '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
                  '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲',
                  '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶',
                  '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️',
                  '👅', '👄', '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜',
                  '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
                  '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯',
                  '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌',
                  '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑',
                  '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️',
                  '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️',
                  '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛',
                  '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵',
                  '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️',
                  '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️',
                  '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿',
                  '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼',
                  '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡',
                  '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣',
                  '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢',
                  '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️',
                  '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️',
                  '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️',
                  '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖',
                  '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰',
                  '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴',
                  '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻',
                  '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽',
                  '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜',
                  '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁️‍🗨️',
                  '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄',
                  '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙',
                  '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣',
                  '🕤', '🕥', '🕦', '🕧', '🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️',
                  '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬',
                  '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧',
                  '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷',
                  '🇮🇴', '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨',
                  '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴',
                  '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾',
                  '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷',
                  '🇪🇪', '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫', '🇵🇫',
                  '🇹🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮', '🇬🇷', '🇬🇱', '🇬🇩',
                  '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳', '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇰',
                  '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹',
                  '🇯🇲', '🇯🇵', '🎌', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇽🇰', '🇰🇼',
                  '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇮', '🇱🇹', '🇱🇺',
                  '🇲🇴', '🇲🇰', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱', '🇲🇹', '🇲🇭', '🇲🇶',
                  '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽', '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇸',
                  '🇲🇦', '🇲🇿', '🇲🇲', '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮',
                  '🇳🇪', '🇳🇬', '🇳🇺', '🇳🇫', '🇰🇵', '🇲🇵', '🇳🇴', '🇴🇲', '🇵🇰', '🇵🇼',
                  '🇵🇸', '🇵🇦', '🇵🇬', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷',
                  '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇺', '🇷🇼', '🇼🇸', '🇸🇲', '🇸🇹', '🇸🇦', '🇸🇳',
                  '🇷🇸', '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰', '🇸🇮', '🇬🇸', '🇸🇧', '🇸🇴',
                  '🇿🇦', '🇰🇷', '🇸🇸', '🇪🇸', '🇱🇰', '🇧🇱', '🇸🇭', '🇰🇳', '🇱🇨', '🇵🇲',
                  '🇻🇨', '🇸🇩', '🇸🇷', '🇸🇿', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇼', '🇹🇯', '🇹🇿',
                  '🇹🇭', '🇹🇱', '🇹🇬', '🇹🇰', '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇨',
                  '🇹🇻', '🇻🇮', '🇺🇬', '🇺🇦', '🇦🇪', '🇬🇧', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿', '🇺🇸',
                  '🇺🇾', '🇺🇿', '🇻🇺', '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫', '🇪🇭', '🇾🇪', '🇿🇲',
                  '🇿🇼', '🔥', '💯', '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰'
                ].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className="emoji-btn"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {selectedPhotos.length > 0 && (
              <div className="photo-preview">
                {selectedPhotos.map((photo, index) => (
                  <img key={index} src={photo} alt={`Preview ${index + 1}`} />
                ))}
              </div>
            )}
            
            {selectedFiles.length > 0 && (
              <div className="file-preview">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    {file.type.startsWith('image/') ? (
                      <img src={file.url} alt={file.name} className="file-image" />
                    ) : file.type.startsWith('video/') ? (
                      <video src={file.url} className="file-video" controls />
                    ) : (
                      <div className="file-doc">
                        <span className="file-icon">{getFileIcon(file.type)}</span>
                        <div className="file-info">
                          <div className="file-name">{file.name}</div>
                          <div className="file-size">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                    )}
                    <button 
                      type="button" 
                      className="file-remove"
                      onClick={() => removeFile(index)}
                    >
                      ✕
                    </button>
                  </div>
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
              <div className="post-avatar">
                {user?.avatar ? (
                  <img 
                    src={user.avatar.startsWith('data:') || user.avatar.startsWith('http') 
                      ? user.avatar 
                      : `http://localhost:3000${user.avatar}`} 
                    alt="Аватар" 
                  />
                ) : (
                  <div className="avatar-placeholder">{user?.name?.charAt(0) || 'U'}</div>
                )}
              </div>
              <div className="post-meta">
                <div className="post-author">{post.author}</div>
                <div className="post-date">{post.date}</div>
              </div>
              <div className="post-menu">
                <button 
                  className="menu-btn"
                  onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                >
                  ⋯
                </button>
                {showPostMenu === post.id && (
                  <div className="post-dropdown">
                    {isOwnProfile ? (
                      <>
                        <button onClick={() => handleEditPost(post)}>Редагувати</button>
                        <button onClick={() => handleDeletePost(post.id)}>Видалити</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleDeletePost(post.id)}>Видалити</button>
                        <button onClick={() => handleReportPost(post.id)}>Поскаржитись</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="post-content">
              {editingPost === post.id ? (
                <div className="edit-form">
                  <textarea 
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-textarea"
                  />
                  <div className="edit-buttons">
                    <button onClick={() => handleSaveEdit(post.id)} className="save-btn">Зберегти</button>
                    <button onClick={handleCancelEdit} className="cancel-edit-btn">Скасувати</button>
                  </div>
                </div>
              ) : (
                <p dangerouslySetInnerHTML={{ __html: renderPostContent(post.content) }}></p>
              )}
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
              {post.files && post.files.length > 0 && (
                <div className="post-files">
                  {post.files.map((file, index) => (
                    <div key={index} className="post-file-item">
                      {file.type.startsWith('image/') ? (
                        <img src={file.url} alt={file.name} className="post-file-image" />
                      ) : file.type.startsWith('video/') ? (
                        <video src={file.url} className="post-file-video" controls />
                      ) : (
                        <div className="post-file-doc">
                          <span className="file-icon">{getFileIcon(file.type)}</span>
                          <div className="file-info">
                            <div className="file-name">{file.name}</div>
                            <div className="file-size">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="post-actions">
              <button 
                className={`like-btn ${post.liked ? 'liked' : ''}`}
                onClick={() => handleLike(post.id)}
              >
                👍 {post.likes}
              </button>
              <button 
                className={`dislike-btn ${post.disliked ? 'disliked' : ''}`}
                onClick={() => handleDislike(post.id)}
              >
                👎 {post.dislikes}
              </button>
              <button 
                className="comment-btn"
                onClick={() => toggleComments(post.id)}
              >
                💬 {post.comments.length}
              </button>
              <button className="share-btn">↗️</button>
            </div>
            
            {showComments[post.id] && (
              <div className="comments-section">
                <div className="comments-list">
                  {post.comments.map(comment => (
                    <div key={comment.id || comment._id} className="comment">
                      <div className="comment-avatar">
                        {comment.avatar ? (
                          <img 
                            src={comment.avatar.startsWith('data:') || comment.avatar.startsWith('http') 
                              ? comment.avatar 
                              : `http://localhost:3000${comment.avatar}`} 
                            alt="Аватар" 
                          />
                        ) : (
                          <div className="avatar-placeholder">{comment.author?.charAt(0) || 'U'}</div>
                        )}
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.author}</span>
                          <span className="comment-date">{comment.date}</span>
                        </div>
                        <div className="comment-text">{comment.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="comment-form">
                  <div className="comment-input-wrapper">
                    <input
                      type="text"
                      placeholder="Написати коментар..."
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                      className="comment-input"
                    />
                    <button 
                      onClick={() => handleCommentSubmit(post.id)}
                      disabled={!commentText[post.id]?.trim()}
                      className="comment-submit"
                    >
                      ➤
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wall;