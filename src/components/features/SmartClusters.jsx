import React, { useState, useMemo } from 'react';
import clusterService from '../../services/clusterService';
import './SmartClusters.css';

const SmartClusters = ({ places, zoom, onPlaceSelect }) => {
  const [selectedCluster, setSelectedCluster] = useState(null);

  const clusters = useMemo(() => {
    return clusterService.createClusters(places, zoom);
  }, [places, zoom]);

  const handleClusterClick = (cluster) => {
    if (cluster.places.length === 1) {
      onPlaceSelect(cluster.places[0]);
    } else {
      setSelectedCluster(selectedCluster?.id === cluster.id ? null : cluster);
    }
  };

  const ClusterMarker = ({ cluster }) => {
    const stats = clusterService.getClusterStats(cluster);
    const isSelected = selectedCluster?.id === cluster.id;

    return (
      <div className="cluster-marker-container">
        <div 
          className={`cluster-marker ${isSelected ? 'selected' : ''}`}
          onClick={() => handleClusterClick(cluster)}
        >
          <div className="cluster-count">{stats.count}</div>
          {stats.avgRating > 0 && (
            <div className="cluster-rating">⭐ {stats.avgRating}</div>
          )}
        </div>

        {isSelected && (
          <div className="cluster-popup">
            <div className="cluster-popup-header">
              <h3>{stats.count} місць поблизу</h3>
              <button 
                className="cluster-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCluster(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="cluster-stats">
              {stats.avgRating > 0 && (
                <div className="stat-item">
                  <span className="stat-icon">⭐</span>
                  <span>Середній рейтинг: {stats.avgRating}</span>
                </div>
              )}
              {stats.categories.length > 0 && (
                <div className="stat-item">
                  <span className="stat-icon">📂</span>
                  <span>Категорії: {stats.categories.join(', ')}</span>
                </div>
              )}
              {stats.priceRange && (
                <div className="stat-item">
                  <span className="stat-icon">💰</span>
                  <span>Ціни: {stats.priceRange}</span>
                </div>
              )}
            </div>

            <div className="cluster-places">
              {cluster.places.map(place => (
                <div 
                  key={place.id}
                  className="cluster-place-item"
                  onClick={() => onPlaceSelect(place)}
                >
                  <div className="place-info">
                    <div className="place-name">{place.name}</div>
                    <div className="place-category">{place.category}</div>
                  </div>
                  <div className="place-meta">
                    {place.rating && (
                      <span className="place-rating">⭐ {place.rating}</span>
                    )}
                    {place.distance && (
                      <span className="place-distance">
                        {place.distance < 1000 ? 
                          `${Math.round(place.distance)}м` : 
                          `${(place.distance/1000).toFixed(1)}км`
                        }
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="cluster-actions">
              <button 
                className="cluster-action-btn"
                onClick={() => {
                  // Показати всі місця на карті
                  cluster.places.forEach(place => onPlaceSelect(place));
                  setSelectedCluster(null);
                }}
              >
                Показати всі на карті
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="smart-clusters">
      {clusters.map(cluster => (
        <ClusterMarker key={cluster.id} cluster={cluster} />
      ))}
    </div>
  );
};

export default SmartClusters;