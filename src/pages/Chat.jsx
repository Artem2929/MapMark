import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import './Chat.css';

const Chat = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide body scroll on chat page
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100vh';
    document.body.style.height = '100vh';
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.height = '100vh';
    }
    const chatPageElement = document.querySelector('.chat-page');
    if (chatPageElement) {
      chatPageElement.style.height = '100vh';
    }
    
    return () => {
      // Restore body scroll when leaving chat page
      document.body.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      document.body.style.height = 'auto';
      if (rootElement) {
        rootElement.style.height = 'auto';
      }
      if (chatPageElement) {
        chatPageElement.style.height = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      const mockUser = {
        id: userId,
        name: 'Anna Kovalenko',
        username: '@anna_k',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
        online: true
      };

      const mockMessages = [
        {
          id: 1,
          text: 'Привіт! Як справи?',
          sender: 'other',
          timestamp: '10:30'
        },
        {
          id: 2,
          text: 'Привіт! Все добре, дякую! А у тебе як?',
          sender: 'me',
          timestamp: '10:32'
        },
        {
          id: 3,
          text: 'Теж все чудово! Бачив твої нові фото з подорожі - просто неймовірні! 📸',
          sender: 'other',
          timestamp: '10:35'
        },
        {
          id: 4,
          text: 'Дякую! Це була справді незабутня поїздка 🏔️',
          sender: 'me',
          timestamp: '10:37'
        }
      ];

      setUser(mockUser);
      setMessages(mockMessages);
      setLoading(false);
    }, 300);
  }, [userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const breadcrumbItems = [
    { label: 'Головна', link: '/' },
    { label: 'Повідомлення', link: '/messages' },
    { label: loading ? 'Завантаження...' : user.name }
  ];

  return (
    <div className="chat-page">
      <div className="chat-container">
        <Breadcrumbs items={breadcrumbItems} />
        
        {loading ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="skeleton-avatar"></div>
                <div className="chat-user-details">
                  <div className="skeleton-name"></div>
                  <div className="skeleton-status"></div>
                </div>
              </div>
            </div>
            <div className="chat-messages">
              <div className="skeleton-message skeleton-message-received"></div>
              <div className="skeleton-message skeleton-message-sent"></div>
              <div className="skeleton-message skeleton-message-received"></div>
            </div>
            <div className="chat-input-form">
              <div className="skeleton-input"></div>
              <div className="skeleton-send-btn"></div>
            </div>
          </>
        ) : (
          <>
            <div className="chat-header">
              <Link to={`/user/${userId}`} className="chat-user-info">
                <div className="chat-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {user.online && <div className="online-indicator"></div>}
                </div>
                <div className="chat-user-details">
                  <h2 className="chat-user-name">{user.name}</h2>
                  <p className="chat-user-status">
                    {user.online ? 'В мережі' : 'Був(ла) нещодавно'}
                  </p>
                </div>
              </Link>
            </div>

            <div className="chat-messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'me' ? 'message-sent' : 'message-received'}`}
            >
              <div className="message-content">
                <p className="message-text">{message.text}</p>
                <span className="message-time">{message.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Напишіть повідомлення..."
                className="chat-input"
              />
              <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                📤
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;