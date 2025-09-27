import React, { useState, useEffect } from 'react';

import './ActivityStats.css';

const ActivityStats = ({ userId }) => {
  const reviews = []; const reviewsLoading = false;
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    countriesVisited: 0,
    monthlyActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate mock data for demonstration
    const mockMonthlyActivity = [
      { month: 'Лип', count: 3 },
      { month: 'Сер', count: 5 },
      { month: 'Вер', count: 2 },
      { month: 'Жов', count: 7 },
      { month: 'Лис', count: 4 },
      { month: 'Гру', count: 6 }
    ];

    setStats({
      totalReviews: 15,
      averageRating: 4.2,
      countriesVisited: 3,
      monthlyActivity: mockMonthlyActivity
    });
    
    setLoading(false);
  }, [userId]);

  const getMonthlyActivity = (reviews) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('uk-UA', { month: 'short' });
      
      const count = reviews.filter(review => {
        const reviewDate = new Date(review.createdAt);
        const reviewKey = `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, '0')}`;
        return reviewKey === monthKey;
      }).length;
      
      months.push({ month: monthName, count });
    }
    
    return months;
  };

  if (loading) {
    return (
      <div className="activity-stats loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const maxActivity = Math.max(...stats.monthlyActivity.map(m => m.count), 1);

  return (
    <div className="activity-stats">
      <h3>Статистика активності</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{stats.totalReviews}</div>
          </div>
          <div className="stat-label">Всього відгуків</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.averageRating}</div>
          </div>
          <div className="stat-label">Середня оцінка</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">🌍</div>
            <div className="stat-value">{stats.countriesVisited}</div>
          </div>
          <div className="stat-label">Країн відвідано</div>
        </div>
      </div>


    </div>
  );
};

export default ActivityStats;