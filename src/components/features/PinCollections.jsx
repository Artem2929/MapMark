import React, { useState, useEffect } from 'react';
import collectionsService from '../../services/collectionsService';
import './PinCollections.css';

const PinCollections = ({ isOpen, onClose, selectedPlace }) => {
  const [collections, setCollections] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', isPublic: false });
  const [activeTab, setActiveTab] = useState('my');

  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen]);

  const loadCollections = () => {
    const userCollections = collectionsService.getAllCollections();
    setCollections(userCollections);
  };

  const handleCreateCollection = () => {
    if (!newCollection.name.trim()) return;
    
    const collection = collectionsService.createCollection(
      newCollection.name,
      newCollection.description,
      newCollection.isPublic
    );
    
    if (selectedPlace) {
      collectionsService.addPlaceToCollection(collection.id, selectedPlace);
    }
    
    setNewCollection({ name: '', description: '', isPublic: false });
    setShowCreateForm(false);
    loadCollections();
  };

  const handleAddToCollection = (collectionId) => {
    if (!selectedPlace) return;
    
    const success = collectionsService.addPlaceToCollection(collectionId, selectedPlace);
    if (success) {
      loadCollections();
      // Show success message
    }
  };

  const handleRemoveFromCollection = (collectionId, placeId) => {
    collectionsService.removePlaceFromCollection(collectionId, placeId);
    loadCollections();
  };

  const handleDeleteCollection = (collectionId) => {
    if (confirm('Ви впевнені, що хочете видалити цю колекцію?')) {
      collectionsService.deleteCollection(collectionId);
      loadCollections();
    }
  };

  const exportCollection = (collectionId) => {
    const route = collectionsService.exportAsRoute(collectionId);
    if (route) {
      const dataStr = JSON.stringify(route, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${route.name.replace(/\s+/g, '_')}_route.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="collections-overlay">
      <div className="collections-panel">
        <div className="collections-header">
          <h2>📍 Мої колекції</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="collections-tabs">
          <button 
            className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            Мої колекції
          </button>
          <button 
            className={`tab-btn ${activeTab === 'public' ? 'active' : ''}`}
            onClick={() => setActiveTab('public')}
          >
            Публічні
          </button>
        </div>

        <div className="collections-content">
          {activeTab === 'my' && (
            <>
              <div className="collections-actions">
                <button 
                  className="create-collection-btn"
                  onClick={() => setShowCreateForm(true)}
                >
                  ➕ Створити колекцію
                </button>
              </div>

              {showCreateForm && (
                <div className="create-form">
                  <input
                    type="text"
                    placeholder="Назва колекції"
                    value={newCollection.name}
                    onChange={(e) => setNewCollection({...newCollection, name: e.target.value})}
                    className="form-input"
                  />
                  <textarea
                    placeholder="Опис (необов'язково)"
                    value={newCollection.description}
                    onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                    className="form-textarea"
                  />
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={newCollection.isPublic}
                      onChange={(e) => setNewCollection({...newCollection, isPublic: e.target.checked})}
                    />
                    Зробити публічною
                  </label>
                  <div className="form-actions">
                    <button className="save-btn" onClick={handleCreateCollection}>
                      Створити
                    </button>
                    <button className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                      Скасувати
                    </button>
                  </div>
                </div>
              )}

              <div className="collections-list">
                {collections.length === 0 ? (
                  <div className="empty-state">
                    <div>📂</div>
                    <p>У вас поки немає колекцій</p>
                    <p>Створіть першу колекцію для збереження улюблених місць</p>
                  </div>
                ) : (
                  collections.map(collection => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                      selectedPlace={selectedPlace}
                      onAddPlace={handleAddToCollection}
                      onRemovePlace={handleRemoveFromCollection}
                      onDelete={handleDeleteCollection}
                      onExport={exportCollection}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'public' && (
            <div className="public-collections">
              <PublicCollections />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CollectionCard = ({ collection, selectedPlace, onAddPlace, onRemovePlace, onDelete, onExport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const stats = collectionsService.getCollectionStats(collection.id);
  const placeInCollection = selectedPlace && 
    collection.places.some(p => p.id === selectedPlace.id);

  return (
    <div className="collection-card">
      <div className="collection-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="collection-info">
          <div className="collection-title">
            <span className="collection-icon" style={{ color: collection.color }}>
              {collection.icon}
            </span>
            <span className="collection-name">{collection.name}</span>
          </div>
          <div className="collection-meta">
            <span>{stats.totalPlaces} місць</span>
            {stats.avgRating > 0 && <span>⭐ {stats.avgRating}</span>}
          </div>
        </div>
        <div className="collection-actions">
          {selectedPlace && (
            <button
              className={`add-place-btn ${placeInCollection ? 'added' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (placeInCollection) {
                  onRemovePlace(collection.id, selectedPlace.id);
                } else {
                  onAddPlace(collection.id);
                }
              }}
            >
              {placeInCollection ? '✓' : '+'}
            </button>
          )}
          <button 
            className="expand-btn"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </button>
        </div>
      </div>

      {collection.description && (
        <div className="collection-description">{collection.description}</div>
      )}

      {isExpanded && (
        <div className="collection-details">
          <div className="collection-places">
            {collection.places.length === 0 ? (
              <p className="no-places">Колекція порожня</p>
            ) : (
              collection.places.map(place => (
                <div key={place.id} className="place-item">
                  <div className="place-info">
                    <div className="place-name">{place.name}</div>
                    <div className="place-category">{place.category}</div>
                  </div>
                  <button
                    className="remove-place-btn"
                    onClick={() => onRemovePlace(collection.id, place.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="collection-footer-actions">
            <button 
              className="export-btn"
              onClick={() => onExport(collection.id)}
              disabled={collection.places.length === 0}
            >
              📤 Експорт маршруту
            </button>
            <button 
              className="delete-btn"
              onClick={() => onDelete(collection.id)}
            >
              🗑️ Видалити
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PublicCollections = () => {
  const publicCollections = collectionsService.getPublicCollections();

  return (
    <div className="public-collections-list">
      {publicCollections.map(collection => (
        <div key={collection.id} className="public-collection-card">
          <div className="public-collection-header">
            <span className="collection-icon" style={{ color: collection.color }}>
              {collection.icon}
            </span>
            <div className="collection-info">
              <div className="collection-name">{collection.name}</div>
              <div className="collection-author">від {collection.author}</div>
            </div>
            <div className="collection-stats">
              <span>{collection.places} місць</span>
              <span>❤️ {collection.likes}</span>
            </div>
          </div>
          <div className="collection-description">{collection.description}</div>
          <div className="public-collection-actions">
            <button className="subscribe-btn">📌 Підписатися</button>
            <button className="view-btn">👁️ Переглянути</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PinCollections;