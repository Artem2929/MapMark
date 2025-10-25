import React, { useState, useEffect, useRef } from 'react';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = () => {
    const mockConversations = [
      {
        id: 1,
        name: 'Олександр Коваленко',
        avatar: null,
        lastMessage: 'Привіт! Як справи?',
        lastMessageTime: '14:30',
        unreadCount: 2,
        isOnline: true
      },
      {
        id: 2,
        name: 'Марина Петренко',
        avatar: null,
        lastMessage: 'Дякую за допомогу!',
        lastMessageTime: '12:15',
        unreadCount: 0,
        isOnline: false
      },
      {
        id: 3,
        name: 'Ірина Мельник',
        avatar: null,
        lastMessage: 'До зустрічі завтра',
        lastMessageTime: 'Вчора',
        unreadCount: 1,
        isOnline: true
      }
    ];
    setConversations(mockConversations);
    if (mockConversations.length > 0) {
      setActiveChat(mockConversations[0]);
    }
  };

  const loadMessages = (chatId) => {
    const mockMessages = {
      1: [
        { id: 1, text: 'Привіт!', sender: 'other', time: '14:25', name: 'Олександр' },
        { id: 2, text: 'Привіт! Як справи?', sender: 'me', time: '14:26' },
        { id: 3, text: 'Все добре, дякую! А у тебе?', sender: 'other', time: '14:27', name: 'Олександр' },
        { id: 4, text: 'Теж все гаразд 😊', sender: 'me', time: '14:28' },
        { id: 5, text: 'Як справи?', sender: 'other', time: '14:30', name: 'Олександр' }
      ],
      2: [
        { id: 1, text: 'Дякую за допомогу з проектом!', sender: 'other', time: '12:10', name: 'Марина' },
        { id: 2, text: 'Будь ласка! Завжди радий допомогти', sender: 'me', time: '12:12' },
        { id: 3, text: 'Дякую за допомогу!', sender: 'other', time: '12:15', name: 'Марина' }
      ],
      3: [
        { id: 1, text: 'Не забудь про зустріч завтра', sender: 'other', time: 'Вчора 18:00', name: 'Ірина' },
        { id: 2, text: 'Звичайно, буду о 10:00', sender: 'me', time: 'Вчора 18:05' },
        { id: 3, text: 'До зустрічі завтра', sender: 'other', time: 'Вчора 18:10', name: 'Ірина' }
      ]
    };
    setMessages(mockMessages[chatId] || []);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (messageContent = newMessage, type = 'text') => {
    if ((!messageContent.trim() && type === 'text') || !activeChat) return;

    const message = {
      id: messages.length + 1,
      text: messageContent,
      type: type,
      sender: 'me',
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setShowEmojiPicker(false);

    // Update conversation last message
    const lastMessageText = type === 'photo' ? '📷 Фото' : messageContent;
    setConversations(prev => prev.map(conv => 
      conv.id === activeChat.id 
        ? { ...conv, lastMessage: lastMessageText, lastMessageTime: message.time }
        : conv
    ));
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleSendMessage(e.target.result, 'photo');
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container messages-page">
      <div className="messages-container">
        <nav className="breadcrumbs">
          <span className="breadcrumb-item">
            <a className="breadcrumb-link" href="/profile/68fca6b223ea8d70a8da03d8" data-discover="true">Профіль</a>
          </span>
          <span className="breadcrumb-item">
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Повідомлення</span>
          </span>
        </nav>

        <div className="messages-layout">
          <div className="conversations-sidebar">
            <div className="conversations-header">
              <h2>Повідомлення</h2>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Пошук розмов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="conversations-list">
              {filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${activeChat?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => setActiveChat(conversation)}
                >
                  <div className="conversation-avatar">
                    {conversation.avatar ? (
                      <img src={conversation.avatar} alt={conversation.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {conversation.name.charAt(0)}
                      </div>
                    )}
                    {conversation.isOnline && <div className="online-indicator"></div>}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{conversation.name}</div>
                    <div className="conversation-last-message">{conversation.lastMessage}</div>
                  </div>
                  <div className="conversation-meta">
                    <div className="conversation-time">{conversation.lastMessageTime}</div>
                    {conversation.unreadCount > 0 && (
                      <div className="unread-badge">{conversation.unreadCount}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-area">
            {activeChat ? (
              <>
                <div className="chat-header">
                  <div className="chat-user-info">
                    <div className="chat-avatar">
                      {activeChat.avatar ? (
                        <img src={activeChat.avatar} alt={activeChat.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {activeChat.name.charAt(0)}
                        </div>
                      )}
                      {activeChat.isOnline && <div className="online-indicator"></div>}
                    </div>
                    <div>
                      <div className="chat-user-name">{activeChat.name}</div>
                      <div className="chat-user-status">
                        {activeChat.isOnline ? 'В мережі' : 'Не в мережі'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="messages-container-inner">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`message ${message.sender === 'me' ? 'message-sent' : 'message-received'}`}
                    >
                      <div className="message-content">
                        {message.type === 'photo' ? (
                          <div className="message-photo">
                            <img src={message.text} alt="Повідомлення" />
                          </div>
                        ) : (
                          <div className="message-text">{message.text}</div>
                        )}
                        <div className="message-time">{message.time}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="message-input-container">
                  <div className="message-input-wrapper">
                    <div className="input-actions">
                      <button 
                        className="emoji-button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        😊
                      </button>
                      <button 
                        className="photo-button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📷
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Напишіть повідомлення..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="message-input"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      className="send-button"
                      disabled={!newMessage.trim()}
                    >
                      ➤
                    </button>
                  </div>
                  
                  {showEmojiPicker && (
                    <div className="emoji-picker">
                      {['😊', '😂', '😍', '😘', '😎', '😉', '😋', '😜', '🙄', '😭', '😱', '😡', '😏', '😴', '😇', '😌', '😤', '😒', '😳', '😵', '😷', '😲', '😚', '😐'].map(emoji => (
                        <button
                          key={emoji}
                          className="emoji-option"
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <p>Оберіть розмову для початку спілкування</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;