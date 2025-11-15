import React, { useState, useEffect, useRef } from 'react';
import './Messages.css';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(1);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Привіт! Як справи?', sender: 'other', time: '14:30', name: 'Олексій', status: 'read', reactions: [] },
    { id: 2, text: 'Привіт! Все добре, дякую', sender: 'me', time: '14:32', status: 'read', reactions: [{ emoji: '👍', count: 1 }] },
    { id: 3, text: 'Що робиш сьогодні?', sender: 'other', time: '14:33', name: 'Олексій', status: 'delivered', reactions: [] }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [followerSearchQuery, setFollowerSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [conversations, setConversations] = useState([
    { id: 1, name: 'Олексій Петренко', lastMessage: 'Що робиш сьогодні?', time: '14:33', unread: 0, online: true },
    { id: 2, name: 'Марія Іванова', lastMessage: 'Дякую за допомогу!', time: '12:15', unread: 2, online: false },
    { id: 3, name: 'Андрій Коваль', lastMessage: 'До зустрічі завтра', time: 'Вчора', unread: 0, online: true }
  ]);
  const messagesEndRef = useRef(null);



  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      reactions: []
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Симуляція доставки та прочитання
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);
    
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'read' } : msg
      ));
    }, 3000);
  };

  const handleMessageRightClick = (e, message) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId: message.id
    });
    setSelectedMessage(message);
  };

  const handleDeleteMessage = () => {
    if (selectedMessage) {
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      setContextMenu(null);
      setSelectedMessage(null);
    }
  };

  const closeContextMenu = () => {
    setContextMenu(null);
    setSelectedMessage(null);
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(conv => conv.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(conversations.find(conv => conv.id !== chatId)?.id || null);
      setMessages([]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const message = {
        id: messages.length + 1,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        fileUrl: URL.createObjectURL(file),
        sender: 'me',
        time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        reactions: []
      };
      setMessages(prev => [...prev, message]);
    }
    setShowAttachMenu(false);
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Симуляція запису
      setTimeout(() => {
        const message = {
          id: messages.length + 1,
          type: 'voice',
          duration: '0:05',
          sender: 'me',
          time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
          reactions: []
        };
        setMessages(prev => [...prev, message]);
        setIsRecording(false);
      }, 2000);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleAddReaction = (messageId, emoji) => {
    console.log('Adding reaction:', emoji, 'to message:', messageId);
    setMessages(prev => {
      const updated = prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.emoji === emoji);
          if (existingReaction) {
            const newReactions = msg.reactions.map(r => 
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            );
            console.log('Updated existing reaction:', newReactions);
            return { ...msg, reactions: newReactions };
          } else {
            const newReactions = [...msg.reactions, { emoji, count: 1 }];
            console.log('Added new reaction:', newReactions);
            return { ...msg, reactions: newReactions };
          }
        }
        return msg;
      });
      console.log('All messages after reaction:', updated);
      return updated;
    });
    setShowReactionPicker(null);
  };

  const toggleReactionPicker = (messageId) => {
    setShowReactionPicker(showReactionPicker === messageId ? null : messageId);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find(conv => conv.id === activeChat);

  const followers = [
    { id: 4, name: 'Катерина Сидорова', online: true },
    { id: 5, name: 'Дмитро Мельник', online: false },
    { id: 6, name: 'Світлана Бондар', online: true }
  ];

  const startNewChat = (user) => {
    setShowNewChatModal(false);
    // Логіка створення нового чату
    console.log('Розпочати чат з:', user.name);
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <nav className="breadcrumbs">
          <span className="breadcrumb-item">
            <a className="breadcrumb-link" href="/profile/68fca6b223ea8d70a8da03d8">Профіль</a>
          </span>
          <span className="breadcrumb-item">
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Повідомлення</span>
          </span>
        </nav>

        <div className="messages-header">
          <h1>Повідомлення</h1>
        </div>

        <div className="messages-layout">
          {/* Sidebar */}
          <div className="conversations-sidebar">
            <div className="sidebar-header">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Пошук розмов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                className="new-chat-btn"
                onClick={() => setShowNewChatModal(true)}
                title="Новий чат"
              >
                +
              </button>
            </div>

            <div className="conversations-list">
              {filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation ${activeChat === conv.id ? 'active' : ''}`}
                  onClick={() => setActiveChat(conv.id)}
                >
                  <div className="conv-avatar">
                    {conv.name.charAt(0)}
                    {conv.online && <div className="online-dot"></div>}
                  </div>
                  <div className="conv-info">
                    <div className="conv-name">{conv.name}</div>
                    <div className="conv-last">{conv.lastMessage}</div>
                  </div>
                  <div className="conv-meta">
                    <div className="conv-time">{conv.time}</div>
                    {conv.unread > 0 && <div className="unread-count">{conv.unread}</div>}
                  </div>
                  <button 
                    className="chat-delete-btn"
                    onClick={(e) => handleDeleteChat(conv.id, e)}
                    title="Видалити чат"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            <div className="chat-header">
              <div className="chat-user">
                <div className="chat-avatar">
                  {activeConversation?.name.charAt(0)}
                  {activeConversation?.online && <div className="online-dot"></div>}
                </div>
                <div className="chat-info">
                  <div className="chat-name">{activeConversation?.name}</div>
                </div>
              </div>
            </div>

            <div className="messages-area" onClick={() => { closeContextMenu(); setShowReactionPicker(null); }}>
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender}`}
                  onContextMenu={(e) => handleMessageRightClick(e, message)}
                >
                  <div 
                    className="message-bubble"
                    onDoubleClick={() => handleAddReaction(message.id, '❤️')}
                  >

                    {message.type === 'image' ? (
                      <div className="message-image">
                        <img src={message.fileUrl} alt={message.fileName} />
                        <div className="message-time">
                          {message.time}
                          {message.sender === 'me' && (
                            <span className={`message-status ${message.status}`}>
                              {message.status === 'sent' && '✓'}
                              {message.status === 'delivered' && '✓✓'}
                              {message.status === 'read' && '✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : message.type === 'file' ? (
                      <div className="message-file">
                        <div className="file-icon">📄</div>
                        <div className="file-info">
                          <div className="file-name">{message.fileName}</div>
                          <div className="file-size">{message.fileSize}</div>
                        </div>
                        <div className="message-time">
                          {message.time}
                          {message.sender === 'me' && (
                            <span className={`message-status ${message.status}`}>
                              {message.status === 'sent' && '✓'}
                              {message.status === 'delivered' && '✓✓'}
                              {message.status === 'read' && '✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : message.type === 'voice' ? (
                      <div className="message-voice">
                        <button className="voice-play-btn">▶️</button>
                        <div className="voice-duration">{message.duration}</div>
                        <div className="message-time">
                          {message.time}
                          {message.sender === 'me' && (
                            <span className={`message-status ${message.status}`}>
                              {message.status === 'sent' && '✓'}
                              {message.status === 'delivered' && '✓✓'}
                              {message.status === 'read' && '✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">
                          {message.time}
                          {message.sender === 'me' && (
                            <span className={`message-status ${message.status}`}>
                              {message.status === 'sent' && '✓'}
                              {message.status === 'delivered' && '✓✓'}
                              {message.status === 'read' && '✓✓'}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    {message.sender === 'me' && (
                      <button 
                        className="message-delete-btn"
                        onClick={() => {
                          setMessages(prev => prev.filter(msg => msg.id !== message.id));
                        }}
                        title="Видалити повідомлення"
                      >
                        ×
                      </button>
                    )}
                    

                  </div>
                  
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="message-reactions">
                      {message.reactions.map((reaction, index) => (
                        <div key={index} className="reaction-item">
                          <span className="reaction-emoji">{reaction.emoji}</span>
                          <span className="reaction-count">{reaction.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">Друкує...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input">
              <button 
                className="attach-btn"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                title="Прикріпити файл"
              >
                📎
              </button>
              {showAttachMenu && (
                <div className="attach-menu">
                  <label className="attach-option">
                    <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
                    🖼️ Фото
                  </label>
                  <label className="attach-option">
                    <input type="file" onChange={handleFileUpload} hidden />
                    📄 Файл
                  </label>
                </div>
              )}
              
              <div className="message-input-wrapper">
                <div className="input-actions">
                  <button 
                    className={`voice-btn ${isRecording ? 'recording' : ''}`}
                    onClick={handleVoiceRecord}
                    title="Голосове повідомлення"
                  >
                    {isRecording ? '⏹️' : '🎤'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Напишіть повідомлення..."
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </div>
              
              <button 
                className="send-btn"
                onClick={handleSendMessage} 
                disabled={!newMessage.trim()}
              >
                ↑
              </button>
            </div>
          </div>
        </div>

        {contextMenu && (
          <div 
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="context-menu-item delete" onClick={handleDeleteMessage}>
              🗑️ Видалити повідомлення
            </button>
          </div>
        )}

        {showNewChatModal && (
          <div className="new-chat-modal" onClick={() => setShowNewChatModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Новий чат</h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowNewChatModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Оберіть користувача зі списку ваших підписників:</p>
                <div className="modal-search">
                  <input
                    type="text"
                    placeholder="Пошук користувачів..."
                    value={followerSearchQuery}
                    onChange={(e) => setFollowerSearchQuery(e.target.value)}
                    className="modal-search-input"
                  />
                </div>
                <div className="followers-list">
                  {followers.filter(user => 
                    user.name.toLowerCase().includes(followerSearchQuery.toLowerCase())
                  ).map(user => (
                    <div 
                      key={user.id} 
                      className="follower-item"
                      onClick={() => startNewChat(user)}
                    >
                      <div className="follower-avatar">
                        {user.name.charAt(0)}
                        {user.online && <div className="online-dot"></div>}
                      </div>
                      <div className="follower-info">
                        <div className="follower-name">{user.name}</div>
                      </div>
                    </div>
                  ))}
                  {followers.filter(user => 
                    user.name.toLowerCase().includes(followerSearchQuery.toLowerCase())
                  ).length === 0 && followerSearchQuery && (
                    <div className="no-results">
                      <p>Нічого не знайдено</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;