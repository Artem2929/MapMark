import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Footer from '../components/layout/Footer';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      const mockConversations = [
        {
          id: 1,
          user: {
            name: 'Anna Kovalenko',
            username: '@anna_k',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop'
          },
          lastMessage: 'Дякую за чудові фото з подорожі! 📸',
          timestamp: '2 хв тому',
          unread: 2,
          online: true
        },
        {
          id: 2,
          user: {
            name: 'Maksym Petrenko',
            username: '@max_travel',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop'
          },
          lastMessage: 'Коли плануєш наступну подорож?',
          timestamp: '1 год тому',
          unread: 0,
          online: false
        },
        {
          id: 3,
          user: {
            name: 'Sofia Marchenko',
            username: '@sofia_adventures',
            avatar: null
          },
          lastMessage: 'Привіт! Як справи? Давно не спілкувались',
          timestamp: '3 год тому',
          unread: 1,
          online: true
        }
      ];
      setConversations(mockConversations);
      setLoading(false);
    }, 300);
  }, []);

  const breadcrumbItems = [
    { label: 'Головна', link: '/' },
    { label: 'Профіль', link: '/user/google_user1758463702771' },
    { label: 'Повідомлення' }
  ];

  return (
    <div className="messages-page">
      <div className="messages-container">
        <Breadcrumbs items={breadcrumbItems} />
        
        {loading ? (
          <>
            <div className="messages-header">
              <div className="skeleton-title"></div>
              <div className="skeleton-stats"></div>
            </div>
            <div className="conversations-list">
              <div className="skeleton-conversation"></div>
              <div className="skeleton-conversation"></div>
              <div className="skeleton-conversation"></div>
            </div>
          </>
        ) : (
          <>
            <div className="messages-header">
              <h1 className="messages-title">Повідомлення</h1>
              <div className="messages-stats">
                {conversations.filter(c => c.unread > 0).length} непрочитаних
              </div>
            </div>

            <div className="conversations-list">
          {conversations.map(conversation => (
            <div key={conversation.id} className="conversation-item">
              <Link 
                to={`/user/${conversation.id}`}
                className="conversation-avatar"
              >
                {conversation.user.avatar ? (
                  <img src={conversation.user.avatar} alt={conversation.user.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {conversation.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {conversation.online && <div className="online-indicator"></div>}
              </Link>
              
              <Link 
                to={`/chat/${conversation.user.username.replace('@', '')}`}
                className="conversation-content"
              >
                <div className="conversation-header">
                  <h3 className="conversation-name">{conversation.user.name}</h3>
                  <span className="conversation-time">{conversation.timestamp}</span>
                </div>
                <p className="conversation-message">{conversation.lastMessage}</p>
              </Link>
              
              {conversation.unread > 0 && (
                <div className="unread-badge">{conversation.unread}</div>
              )}
            </div>
          ))}
        </div>

            {conversations.length === 0 && (
              <div className="empty-messages">
                <div>💬</div>
                <h3>Поки що немає повідомлень</h3>
                <p>Почніть спілкування з іншими користувачами</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Messages;