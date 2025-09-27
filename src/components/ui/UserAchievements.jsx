import React, { useState, useEffect } from 'react';
import './UserAchievements.css';

const UserAchievements = ({ userId }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateAchievements = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/user/${userId}/reviews`);
        const data = await response.json();
        
        if (data.success) {
          const reviews = data.data;
          const userAchievements = [];

          // Перший відгук
          if (reviews.length >= 1) {
            userAchievements.push({
              id: 'first-review',
              title: 'Перший крок',
              description: 'Залишив перший відгук',
              icon: '🎯',
              unlocked: true,
              date: reviews[0]?.createdAt
            });
          }

          // 10 відгуків
          if (reviews.length >= 10) {
            userAchievements.push({
              id: 'ten-reviews',
              title: 'Активний мандрівник',
              description: 'Залишив 10 відгуків',
              icon: '🌟',
              unlocked: true,
              date: reviews[9]?.createdAt
            });
          }

          // Високі оцінки
          const highRatings = reviews.filter(r => r.rating >= 4).length;
          if (highRatings >= 5) {
            userAchievements.push({
              id: 'positive-reviewer',
              title: 'Позитивний критик',
              description: 'Поставив 5 високих оцінок',
              icon: '⭐',
              unlocked: true
            });
          }

          // Різні країни
          const countries = new Set(reviews.map(r => r.country).filter(Boolean));
          if (countries.size >= 3) {
            userAchievements.push({
              id: 'world-traveler',
              title: 'Світовий мандрівник',
              description: `Відвідав ${countries.size} країн`,
              icon: '🌍',
              unlocked: true
            });
          }

          // Заблоковані досягнення
          const lockedAchievements = [
            {
              id: 'hundred-reviews',
              title: 'Експерт',
              description: 'Залишити 100 відгуків',
              icon: '🏆',
              unlocked: reviews.length >= 100,
              progress: Math.min(reviews.length, 100)
            },
            {
              id: 'ten-countries',
              title: 'Глобальний дослідник',
              description: 'Відвідати 10 країн',
              icon: '🗺️',
              unlocked: countries.size >= 10,
              progress: Math.min(countries.size, 10)
            }
          ];

          setAchievements([...userAchievements, ...lockedAchievements]);
        }
      } catch (error) {
        console.error('Error calculating achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      calculateAchievements();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="user-achievements loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-achievements">
      <h3>Досягнення ({achievements.filter(a => a.unlocked).length})</h3>
      
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-content">
              <div className="achievement-title">{achievement.title}</div>
              <div className="achievement-description">{achievement.description}</div>
              {!achievement.unlocked && achievement.progress !== undefined && (
                <div className="achievement-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(achievement.progress / (achievement.id === 'hundred-reviews' ? 100 : 10)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {achievement.progress}/{achievement.id === 'hundred-reviews' ? 100 : 10}
                  </div>
                </div>
              )}
              {achievement.unlocked && achievement.date && (
                <div className="achievement-date">
                  {new Date(achievement.date).toLocaleDateString('uk-UA')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserAchievements;