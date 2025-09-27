import React, { useState, useEffect } from 'react';
import './ActivityStats.css';

const ActivityStats = ({ userId }) => {
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    countriesVisited: 0,
    monthlyActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityStats = async () => {
      try {
        const [reviewsResponse, statsResponse] = await Promise.all([
          fetch(`http://localhost:3000/api/user/${userId}/reviews`),
          fetch(`http://localhost:3000/api/user/${userId}/stats`)
        ]);

        const reviewsData = await reviewsResponse.json();
        const statsData = await statsResponse.json();

        if (reviewsData.success && statsData.success) {
          const reviews = reviewsData.data;
          
          // Calculate stats
          const totalReviews = reviews.length;
          const averageRating = reviews.length > 0 
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
            : 0;
          
          const countries = new Set(reviews.map(r => r.country).filter(Boolean));
          const countriesVisited = countries.size;

          // Monthly activity (last 6 months)
          const monthlyActivity = getMonthlyActivity(reviews);

          setStats({
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            countriesVisited,
            monthlyActivity
          });
        }
      } catch (error) {
        console.error('Error fetching activity stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivityStats();
    }
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
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.totalReviews}</div>
          <div className="stat-label">Всього відгуків</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.averageRating}</div>
          <div className="stat-label">Середня оцінка</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-value">{stats.countriesVisited}</div>
          <div className="stat-label">Країн відвідано</div>
        </div>
      </div>

      <div className="activity-chart">
        <h4>Активність за місяцями</h4>
        <div className="chart-bars">
          {stats.monthlyActivity.map((month, index) => (
            <div key={index} className="chart-bar-container">
              <div 
                className="chart-bar"
                style={{ 
                  height: `${(month.count / maxActivity) * 100}%`,
                  minHeight: month.count > 0 ? '4px' : '2px'
                }}
              >
                <span className="bar-value">{month.count}</span>
              </div>
              <div className="bar-label">{month.month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;