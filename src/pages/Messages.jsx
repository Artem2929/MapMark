import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import messagesService from '../services/messagesService';
import { friendsService } from '../services/friendsService';
import './Messages.css';

// Кеш для даних користувачів
const userCache = new Map();

// Функція для отримання повних даних користувача
const getUserData = async (userId, token) => {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }
  
  try {
    const response = await fetch(`http://localhost:3001/api/user/${userId}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      if (userData.success && userData.data) {
        const userInfo = {
          _id: userData.data._id,
          name: userData.data.name,
          username: userData.data.name,
          email: userData.data.email,
          avatar: userData.data.avatar,
          isOnline: userData.data.isOnline,
          lastSeen: userData.data.lastSeen
        };
        userCache.set(userId, userInfo);
        return userInfo;
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
  
  return null;
};

// Функція для покращення даних учасника
const enhanceParticipant = async (participant, token) => {
  if (!participant || !participant._id) return participant;
  
  const userData = await getUserData(participant._id, token);
  if (userData) {
    return { ...participant, ...userData };
  }
  
  return participant;
};

const Messages = () => {
  const location = useLocation();
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
  const [forceUpdate, setForceUpdate] = useState(0);
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
        const socket = messagesService.initSocket();
        
        // Перевіряємо WebSocket стан
        console.log('Socket state:', socket?.connected);
        console.log('Socket ID:', socket?.id);
        
        // Завантаження розмов
        try {
          const conversationsData = await messagesService.getConversations();
          console.log('Conversations data:', conversationsData);
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
        
        console.log('WebSocket event listeners set up');
        
        // Перевіряємо чи потрібно почати чат з конкретним користувачем
        if (location.state?.startChatWithUser) {
          const userId = location.state.startChatWithUser;
          try {
            const conversation = await messagesService.createConversation(userId);
            setConversations(prev => {
              const exists = prev.find(conv => conv._id === conversation._id);
              if (exists) return prev;
              return [conversation, ...prev];
            });
            setActiveChat(conversation._id);
          } catch (error) {
            console.error('Error starting chat with user:', error);
          }
        }
        
      } catch (error) {
        // Error handled
      } finally {
        setLoading(false);
      }
    };
    
    initializeMessages();
    
    return () => {
      // Відписуємося від подій перед відключенням
      messagesService.off('newMessage', handleNewMessage);
      messagesService.off('messageDeleted', handleMessageDeleted);
      messagesService.off('messagesRead', handleMessagesRead);
      messagesService.off('userTyping', handleUserTyping);
      messagesService.off('userOnline', handleUserOnline);
      messagesService.off('userOffline', handleUserOffline);
      messagesService.disconnect();
    };
  }, []);
  
  // Завантаження повідомлень при зміні активного чату
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
      messagesService.joinConversation(activeChat);
      messagesService.markAsRead(activeChat);
      
      // Обнуляємо unreadCount для активної розмови
      setConversations(prev => prev.map(conv => 
        conv._id === activeChat 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
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
    // Примусове оновлення при зміні повідомлень
    setForceUpdate(prev => prev + 1);
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
      
      // Оновити останнє повідомлення в розмові (без збільшення unreadCount для відправника)
      setConversations(prev => prev.map(conv => 
        conv._id === activeChat 
          ? { ...conv, lastMessage: message, lastActivity: new Date() }
          : conv
      ));
      
      // Примусове оновлення
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      // Error handled
    }
  };
  
  // WebSocket обробники
  const handleNewMessage = useCallback((message) => {
    console.log('Processing new message:', message);
    
    if (message.conversation === activeChat) {
      setMessages(prev => {
        // Перевіряємо чи повідомлення вже існує
        const exists = prev.find(msg => msg._id === message._id);
        if (exists) return prev;
        
        const newMessages = [...prev, message];
        console.log('Updated messages:', newMessages);
        return newMessages;
      });
      
      // Примусове оновлення для виправлення проблеми з рендерингом
      setTimeout(() => {
        scrollToBottom();
        setForceUpdate(prev => prev + 1);
      }, 50);
    }
    
    // Оновити розмову - збільшувати unreadCount тільки якщо повідомлення не від поточного користувача
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv._id === message.conversation
          ? { 
              ...conv, 
              lastMessage: message, 
              lastActivity: new Date(), 
              unreadCount: message.sender._id === currentUser?.id ? conv.unreadCount : (message.conversation === activeChat ? conv.unreadCount : conv.unreadCount + 1),
              // Зберігаємо існуючі дані учасника, не перезаписуємо їх
              participant: conv.participant
            }
          : conv
      );
      console.log('Updated conversations:', updated);
      return updated;
    });
    
    // Додаткове примусове оновлення
    setTimeout(() => setForceUpdate(prev => prev + 1), 100);
  }, [activeChat, currentUser?.id]);
  
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
    // Перевіряємо чи query є рядком
    const searchQuery = typeof query === 'string' ? query : '';
    
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    
    setSearchLoading(true);
    
    try {
      // Спочатку спробуємо messagesService
      try {
        const users = await messagesService.searchUsers(searchQuery);
        
        if (!users || users.length === 0) {
          throw new Error('No users found in messagesService');
        }
        
        const formattedUsers = users.map(user => ({
          _id: user._id,
          username: user.name || user.username || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || 'Unknown'),
          email: user.email || '',
          avatar: user.avatar,
          isOnline: user.isOnline
        }));
        
        setSearchResults(formattedUsers);
        return;
      } catch (messagesError) {
        const friendsResult = await friendsService.searchUsers(searchQuery);
        
        if (friendsResult.success) {
          const formattedUsers = friendsResult.data.map(user => ({
            _id: user.id || user._id,
            username: user.name || user.username || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || 'Unknown'),
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
      console.log('Created conversation:', conversation);
      
      setActiveChat(conversation._id);
      
      const updatedConversations = await messagesService.getConversations();
      console.log('Updated conversations after creating chat:', updatedConversations);
      
      // Оновлюємо дані учасника з інформацією з пошуку
      const enhancedConversations = updatedConversations.map(conv => {
        if (conv.participant._id === user._id) {
          return {
            ...conv,
            participant: {
              ...conv.participant,
              name: user.username,
              username: user.username
            }
          };
        }
        return conv;
      });
      
      setConversations(enhancedConversations);
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
                    filteredConversations.map((conv, index) => (
                <div
                  key={`${conv._id}-${index}-${forceUpdate}`}
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
                      {conv.participant?.name || 
                       conv.participant?.username || 
                       (conv.participant?.firstName && conv.participant?.lastName 
                         ? `${conv.participant.firstName} ${conv.participant.lastName}` 
                         : conv.participant?.firstName || conv.participant?.lastName || 
                           (conv.participant?.email ? conv.participant.email.split('@')[0] : 'Невідомий користувач'))}
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
                      {activeConversation.participant?.name || 
                       activeConversation.participant?.username || 
                       (activeConversation.participant?.firstName && activeConversation.participant?.lastName 
                         ? `${activeConversation.participant.firstName} ${activeConversation.participant.lastName}` 
                         : activeConversation.participant?.firstName || activeConversation.participant?.lastName || 
                           (activeConversation.participant?.email ? activeConversation.participant.email.split('@')[0] : 'Невідомий користувач'))}
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
              key={`messages-${forceUpdate}`}
            >
              {messages.map((message, index) => {
                const isMyMessage = message.sender._id === currentUser?.id;
                return (
                <div 
                  key={`${message._id}-${index}-${forceUpdate}`} 
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