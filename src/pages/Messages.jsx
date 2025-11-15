import React, { useState, useEffect, useRef } from 'react';
import messagesService from '../services/messagesService';
import { friendsService } from '../services/friendsService';
import './Messages.css';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [followerSearchQuery, setFollowerSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Ініціалізація
  useEffect(() => {
    const initializeMessages = async () => {
      try {
        setLoading(true);
        
        // Отримання токена та ініціалізація
        const authToken = localStorage.getItem('accessToken');
        
        if (!authToken) {
          setLoading(false);
          return;
        }
        
        messagesService.setToken(authToken);
        messagesService.initSocket();
        
        // Завантаження розмов
        try {
          const conversationsData = await messagesService.getConversations();
          setConversations(conversationsData || []);
        } catch (error) {
          setConversations([]);
        }
        
        // Встановлення поточного користувача
        const token = localStorage.getItem('accessToken');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({ id: payload.id });
        }
        
        // Підписка на WebSocket події
        messagesService.onNewMessage(handleNewMessage);
        messagesService.onMessageDeleted(handleMessageDeleted);
        messagesService.onMessagesRead(handleMessagesRead);
        messagesService.onUserTyping(handleUserTyping);
        messagesService.onUserOnline(handleUserOnline);
        messagesService.onUserOffline(handleUserOffline);
        
      } catch (error) {
        // Error handled
      } finally {
        setLoading(false);
      }
    };
    
    initializeMessages();
    
    return () => {
      messagesService.disconnect();
    };
  }, []);
  
  // Завантаження повідомлень при зміні активного чату
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
      messagesService.joinConversation(activeChat);
      messagesService.markAsRead(activeChat);
    }
    
    return () => {
      if (activeChat) {
        messagesService.leaveConversation(activeChat);
      }
    };
  }, [activeChat]);
  
  // Прокрутка до останнього повідомлення
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const loadMessages = async (conversationId) => {
    try {
      const messagesData = await messagesService.getMessages(conversationId);
      setMessages(messagesData);
    } catch (error) {
      // Error handled
    }
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      const message = await messagesService.sendMessage(activeChat, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Оновити останнє повідомлення в розмові
      setConversations(prev => prev.map(conv => 
        conv._id === activeChat 
          ? { ...conv, lastMessage: message, lastActivity: new Date() }
          : conv
      ));
    } catch (error) {
      // Error handled
    }
  };
  
  // WebSocket обробники
  const handleNewMessage = (message) => {
    if (message.conversation === activeChat) {
      setMessages(prev => [...prev, message]);
    }
    
    // Оновити розмову
    setConversations(prev => prev.map(conv => 
      conv._id === message.conversation
        ? { ...conv, lastMessage: message, lastActivity: new Date(), unreadCount: conv.unreadCount + 1 }
        : conv
    ));
  };
  
  const handleMessageDeleted = ({ messageId }) => {
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
  };
  
  const handleMessagesRead = ({ userId }) => {
    setMessages(prev => prev.map(msg => 
      msg.sender._id !== currentUser?.id ? { ...msg, status: 'read' } : msg
    ));
  };
  
  const handleUserTyping = ({ userId, isTyping }) => {
    setIsTyping(isTyping);
    if (isTyping) {
      setTimeout(() => setIsTyping(false), 3000);
    }
  };
  
  const handleUserOnline = ({ userId }) => {
    setConversations(prev => prev.map(conv => 
      conv.participant._id === userId
        ? { ...conv, participant: { ...conv.participant, isOnline: true } }
        : conv
    ));
  };
  
  const handleUserOffline = ({ userId }) => {
    setConversations(prev => prev.map(conv => 
      conv.participant._id === userId
        ? { ...conv, participant: { ...conv.participant, isOnline: false } }
        : conv
    ));
  };

  const handleMessageRightClick = (e, message) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId: message._id
    });
    setSelectedMessage(message);
  };

  const handleDeleteMessage = async () => {
    if (selectedMessage) {
      try {
        await messagesService.deleteMessage(selectedMessage._id);
        setMessages(prev => prev.filter(msg => msg._id !== selectedMessage._id));
        setContextMenu(null);
        setSelectedMessage(null);
      } catch (error) {
        // Error handled
      }
    }
  };

  const closeContextMenu = () => {
    setContextMenu(null);
    setSelectedMessage(null);
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await messagesService.deleteConversation(chatId);
      setConversations(prev => prev.filter(conv => conv._id !== chatId));
      if (activeChat === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (error) {
      // Error handled
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Відправити подію друкування
    if (activeChat) {
      messagesService.sendTyping(activeChat, true);
      
      // Скасувати попередній таймер
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Встановити новий таймер
      typingTimeoutRef.current = setTimeout(() => {
        messagesService.sendTyping(activeChat, false);
      }, 1000);
    }
  };

  // Пошук користувачів
  const searchUsers = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    
    setSearchLoading(true);
    
    try {
      // Спочатку спробуємо messagesService
      try {
        const users = await messagesService.searchUsers(query);
        
        if (!users || users.length === 0) {
          throw new Error('No users found in messagesService');
        }
        
        const formattedUsers = users.map(user => ({
          _id: user._id,
          username: user.username || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || 'Unknown'),
          email: user.email || '',
          avatar: user.avatar,
          isOnline: user.isOnline
        }));
        
        setSearchResults(formattedUsers);
        return;
      } catch (messagesError) {
        const friendsResult = await friendsService.searchUsers(query);
        
        if (friendsResult.success) {
          const formattedUsers = friendsResult.data.map(user => ({
            _id: user.id || user._id,
            username: user.username || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || 'Unknown'),
            email: user.email || '',
            avatar: user.avatar,
            isOnline: user.isOnline || user.status === 'online'
          }));
          setSearchResults(formattedUsers);
        } else {
          throw new Error(friendsResult.error || 'Friends search failed');
        }
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(followerSearchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [followerSearchQuery]);

  const startNewChat = async (user) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        alert('Ви не авторизовані. Будь ласка, увійдіть в систему.');
        return;
      }
      
      messagesService.setToken(token);
      
      const conversation = await messagesService.createConversation(user._id);
      
      setActiveChat(conversation._id);
      
      const updatedConversations = await messagesService.getConversations();
      setConversations(updatedConversations);
      setShowNewChatModal(false);
      setFollowerSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      if (error.message.includes('No authentication token')) {
        alert('Помилка авторизації. Будь ласка, перезавантажте сторінку та увійдіть знову.');
      } else {
        alert('Помилка при створенні чату: ' + error.message);
      }
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchQuery.toLowerCase();
    const participant = conv.participant;
    
    return (
      participant?.username?.toLowerCase().includes(searchLower) ||
      participant?.firstName?.toLowerCase().includes(searchLower) ||
      participant?.lastName?.toLowerCase().includes(searchLower) ||
      participant?.email?.toLowerCase().includes(searchLower) ||
      `${participant?.firstName || ''} ${participant?.lastName || ''}`.toLowerCase().includes(searchLower)
    );
  });

  const activeConversation = conversations.find(conv => conv._id === activeChat);

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
              {loading ? (
                <div className="loading">Завантаження...</div>
              ) : (
                <>
                  {filteredConversations.length === 0 ? (
                    <div className="no-results">
                      <p>Немає розмов</p>
                    </div>
                  ) : (
                    filteredConversations.map(conv => (
                <div
                  key={conv._id}
                  className={`conversation ${activeChat === conv._id ? 'active' : ''}`}
                  onClick={() => setActiveChat(conv._id)}
                >
                  <div className="conv-avatar">
                    {conv.participant?.avatar ? (
                      <img 
                        src={conv.participant.avatar.startsWith('http') ? conv.participant.avatar : `http://localhost:3001${conv.participant.avatar}`} 
                        alt={conv.participant.username} 
                      />
                    ) : (
                      conv.participant?.username?.charAt(0)?.toUpperCase() || '?'
                    )}
                    {conv.participant?.isOnline && <div className="online-dot"></div>}
                  </div>
                  <div className="conv-info">
                    <div className="conv-name">
                      {conv.participant?.username || 
                       (conv.participant?.firstName && conv.participant?.lastName 
                         ? `${conv.participant.firstName} ${conv.participant.lastName}` 
                         : conv.participant?.firstName || conv.participant?.lastName || 'Невідомий користувач')}
                    </div>
                    <div className="conv-last">
                      {conv.lastMessage?.content || 'Немає повідомлень'}
                    </div>
                  </div>
                  <div className="conv-meta">
                    <div className="conv-time">
                      {conv.lastActivity ? new Date(conv.lastActivity).toLocaleTimeString('uk-UA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : ''}
                    </div>
                    {conv.unreadCount > 0 && <div className="unread-count">{conv.unreadCount}</div>}
                  </div>
                  <button 
                    className="chat-delete-btn"
                    onClick={(e) => handleDeleteChat(conv._id, e)}
                    title="Видалити чат"
                  >
                    ×
                  </button>
                </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            <div className="chat-header">
              {activeConversation ? (
                <div className="chat-user">
                  <div className="chat-avatar">
                    {activeConversation.participant?.avatar ? (
                      <img 
                        src={activeConversation.participant.avatar.startsWith('http') ? activeConversation.participant.avatar : `http://localhost:3001${activeConversation.participant.avatar}`} 
                        alt={activeConversation.participant.username} 
                      />
                    ) : (
                      activeConversation.participant?.username?.charAt(0)?.toUpperCase() || '?'
                    )}
                    {activeConversation.participant?.isOnline && <div className="online-dot"></div>}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">
                      {activeConversation.participant?.username || 
                       (activeConversation.participant?.firstName && activeConversation.participant?.lastName 
                         ? `${activeConversation.participant.firstName} ${activeConversation.participant.lastName}` 
                         : activeConversation.participant?.firstName || activeConversation.participant?.lastName || 'Невідомий користувач')}
                    </div>
                    <div className="chat-status">
                      {isTyping ? (
                        <div className="typing-status">
                          <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <span className="typing-text">друкує...</span>
                        </div>
                      ) : (
                        activeConversation.participant?.isOnline ? 'В мережі' : 
                        `Був(ла) ${activeConversation.participant?.lastSeen ? 
                          new Date(activeConversation.participant.lastSeen).toLocaleString('uk-UA') : 
                          'нещодавно'}`
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-chat-selected">
                  <h3>Оберіть розмову</h3>
                  <p>Виберіть розмову зі списку або створіть нову</p>
                </div>
              )}
            </div>

            <div 
              className="messages-area"
              onClick={() => closeContextMenu()}
            >
              {messages.map(message => {
                const isMyMessage = message.sender._id === currentUser?.id;
                return (
                <div 
                  key={message._id} 
                  className={`message ${isMyMessage ? 'me' : 'other'}`}
                  onContextMenu={(e) => handleMessageRightClick(e, message)}
                >
                  <div className="message-bubble">
                    <div className="message-text">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString('uk-UA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {isMyMessage && (
                        <span className={`message-status ${message.status}`}>
                          {message.status === 'sent' && '✓'}
                          {message.status === 'delivered' && '✓✓'}
                          {message.status === 'read' && '✓✓'}
                        </span>
                      )}
                    </div>
                    {isMyMessage && (
                      <button 
                        className="message-delete-btn"
                        onClick={handleDeleteMessage}
                        title="Видалити повідомлення"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )})}

              <div ref={messagesEndRef} />
            </div>

            {activeChat && (
              <div className="message-input">
                <div className="message-input-wrapper">
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
            )}
          </div>
        </div>

        {contextMenu && (
          <div 
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="context-menu-item" onClick={handleDeleteMessage}>
              🗑️ Видалити
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
                <p>Знайдіть користувача для початку розмови:</p>
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
                  {searchLoading ? (
                    <div className="loading">Пошук...</div>
                  ) : (
                    <>
                      {searchResults.map(user => (
                        <div 
                          key={user._id} 
                          className="follower-item"
                          onClick={() => startNewChat(user)}
                        >
                          <div className="follower-avatar">
                            {user.avatar ? (
                              <img 
                                src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:3001${user.avatar}`} 
                                alt={user.username} 
                              />
                            ) : (
                              user.username?.charAt(0)?.toUpperCase() || '?'
                            )}
                            {user.isOnline && <div className="online-dot"></div>}
                          </div>
                          <div className="follower-info">
                            <div className="follower-name">{user.username || user.email}</div>
                            <div className="follower-email">{user.email}</div>
                          </div>
                        </div>
                      ))}
                      {searchResults.length === 0 && followerSearchQuery && !searchLoading && (
                        <div className="no-results">
                          <p>Нічого не знайдено</p>
                        </div>
                      )}
                    </>
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