import React, { useState, useEffect } from 'react';
import gamificationService from '../../services/gamificationService';
import './GamificationPanel.css';

const GamificationPanel = ({ isOpen, onClose }) => {
  const [userProgress, setUserProgress] = useState(null);
  const [recentBadges, setRecentBadges] = useState([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = () => {
    const progress = gamificationService.getUserProgress();
    const position = gamificationService.getLeaderboardPosition();
    
    setUserProgress(progress);
    setLeaderboardPosition(position);
    
    // Get recent badges (last 3)
    const allBadges = progress.badges.map(badgeId => 
      gamificationService.badges[badgeId]
    ).filter(Boolean);
    setRecentBadges(allBadges.slice(-3));
  };

  const simulateActivity = (type) => {
    const newBadges = gamificationService.checkBadges({ type });
    const pointsResult = gamificationService.addPoints(
      type === 'review' ? 15 : type === 'photo' ? 10 : 5,
      `Активність: ${type}`
    );
    
    loadUserData(); // Refresh data
    
    if (newBadges.length > 0) {
      alert(`🎉 Новий бейдж: ${newBadges[0].name}!`);
    }
  };

  if (!isOpen || !userProgress) return null;

  return (
    <div className="gamification-overlay">
      <div className="gamification-panel">
        <div className="panel-header">
          <h2>🏆 Ваші досягнення</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* User Level & Progress */}
        <div className="level-section">
          <div className="level-info">
            <div className="level-icon">{userProgress.currentLevel?.icon}</div>
            <div className="level-details">
              <h3>Рівень {userProgress.level}</h3>
              <p>{userProgress.currentLevel?.name}</p>
            </div>
            <div className="points-display">
              <span className="points">{userProgress.points}</span>
              <span className="points-label">балів</span>
            </div>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${userProgress.progressToNext}%` }}
            />
          </div>
          
          {userProgress.nextLevel && (
            <div className="next-level">
              До рівня {userProgress.nextLevel.level}: 
              {userProgress.nextLevel.minPoints - userProgress.points} балів
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{userProgress.reviewsCount}</div>
            <div className="stat-label">Відгуків</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📸</div>
            <div className="stat-value">{userProgress.photosCount}</div>
            <div className="stat-label">Фото</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📍</div>
            <div className="stat-value">{userProgress.placesVisited}</div>
            <div className="stat-label">Місць</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{userProgress.streak}</div>
            <div className="stat-label">Днів поспіль</div>
          </div>
        </div>

        {/* Recent Badges */}
        <div className="badges-section">
          <h3>🏅 Останні бейджі</h3>
          {recentBadges.length > 0 ? (
            <div className="badges-grid">
              {recentBadges.map(badge => (
                <div key={badge.id} className="badge-item">
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-points">+{badge.points} балів</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-badges">Поки що немає бейджів. Почніть залишати відгуки!</p>
          )}
        </div>

        {/* All Badges */}
        <div className="all-badges-section">
          <h3>🎖️ Всі бейджі</h3>
          <div className="badges-grid">
            {Object.values(gamificationService.badges).map(badge => {
              const isEarned = userProgress.badges.includes(badge.id);
              return (
                <div 
                  key={badge.id} 
                  className={`badge-item ${isEarned ? 'earned' : 'locked'}`}
                >
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-points">
                    {isEarned ? '✅' : `${badge.points} балів`}
                  </div>
                  {badge.requirement && !isEarned && (
                    <div className="badge-requirement">
                      Потрібно: {badge.requirement}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="leaderboard-section">
          <h3>🏆 Рейтинг</h3>
          <div className="leaderboard-position">
            <span className="position-icon">🏅</span>
            <span>Ваша позиція: #{leaderboardPosition}</span>
          </div>
        </div>

        {/* Demo Actions */}
        <div className="demo-actions">
          <h3>🎮 Тестові дії</h3>
          <div className="action-buttons">
            <button 
              className="action-btn review-btn"
              onClick={() => simulateActivity('review')}
            >
              📝 Додати відгук
            </button>
            <button 
              className="action-btn photo-btn"
              onClick={() => simulateActivity('photo')}
            >
              📸 Додати фото
            </button>
            <button 
              className="action-btn visit-btn"
              onClick={() => simulateActivity('visit')}
            >
              📍 Відвідати місце
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;