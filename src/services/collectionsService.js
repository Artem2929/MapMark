// Pin Collections Service - Персональні колекції місць
class CollectionsService {
  constructor() {
    this.collections = this.loadCollections();
  }

  loadCollections() {
    return JSON.parse(localStorage.getItem('mapmark_collections')) || [];
  }

  saveCollections() {
    localStorage.setItem('mapmark_collections', JSON.stringify(this.collections));
  }

  // Створення нової колекції
  createCollection(name, description = '', isPublic = false) {
    const collection = {
      id: Date.now().toString(),
      name,
      description,
      isPublic,
      places: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: this.getRandomColor(),
      icon: this.getRandomIcon()
    };

    this.collections.push(collection);
    this.saveCollections();
    return collection;
  }

  // Додавання місця в колекцію
  addPlaceToCollection(collectionId, place) {
    const collection = this.collections.find(c => c.id === collectionId);
    if (!collection) return false;

    // Перевірка чи місце вже є в колекції
    const exists = collection.places.some(p => p.id === place.id);
    if (exists) return false;

    collection.places.push({
      id: place.id,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      category: place.category,
      rating: place.rating,
      addedAt: new Date().toISOString()
    });

    collection.updatedAt = new Date().toISOString();
    this.saveCollections();
    return true;
  }

  // Видалення місця з колекції
  removePlaceFromCollection(collectionId, placeId) {
    const collection = this.collections.find(c => c.id === collectionId);
    if (!collection) return false;

    collection.places = collection.places.filter(p => p.id !== placeId);
    collection.updatedAt = new Date().toISOString();
    this.saveCollections();
    return true;
  }

  // Отримання всіх колекцій
  getAllCollections() {
    return this.collections;
  }

  // Отримання колекції за ID
  getCollection(id) {
    return this.collections.find(c => c.id === id);
  }

  // Видалення колекції
  deleteCollection(id) {
    this.collections = this.collections.filter(c => c.id !== id);
    this.saveCollections();
  }

  // Оновлення колекції
  updateCollection(id, updates) {
    const collection = this.collections.find(c => c.id === id);
    if (!collection) return false;

    Object.assign(collection, updates, {
      updatedAt: new Date().toISOString()
    });

    this.saveCollections();
    return collection;
  }

  // Пошук колекцій
  searchCollections(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.collections.filter(collection =>
      collection.name.toLowerCase().includes(lowercaseQuery) ||
      collection.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Експорт колекції як маршрут
  exportAsRoute(collectionId) {
    const collection = this.getCollection(collectionId);
    if (!collection || collection.places.length === 0) return null;

    return {
      name: collection.name,
      waypoints: collection.places.map(place => ({
        lat: place.lat,
        lng: place.lng,
        name: place.name
      })),
      exportedAt: new Date().toISOString()
    };
  }

  // Отримання статистики колекції
  getCollectionStats(collectionId) {
    const collection = this.getCollection(collectionId);
    if (!collection) return null;

    const categories = [...new Set(collection.places.map(p => p.category))];
    const ratings = collection.places.filter(p => p.rating).map(p => p.rating);
    const avgRating = ratings.length > 0 ? 
      ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

    return {
      totalPlaces: collection.places.length,
      categories: categories.length,
      avgRating: Math.round(avgRating * 10) / 10,
      lastUpdated: collection.updatedAt
    };
  }

  // Перевірка чи місце є в якійсь колекції
  isPlaceInCollections(placeId) {
    const collectionsWithPlace = this.collections.filter(collection =>
      collection.places.some(place => place.id === placeId)
    );
    return collectionsWithPlace.map(c => ({ id: c.id, name: c.name, color: c.color }));
  }

  // Отримання рандомного кольору для колекції
  getRandomColor() {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Отримання рандомної іконки для колекції
  getRandomIcon() {
    const icons = ['📍', '⭐', '❤️', '🎯', '🏆', '🎨', '🌟', '💎'];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  // Публічні колекції (mock)
  getPublicCollections() {
    return [
      {
        id: 'public_1',
        name: 'Романтичні місця Києва',
        description: 'Найкращі місця для побачень',
        author: 'Олена К.',
        places: 12,
        likes: 45,
        color: '#ef4444',
        icon: '💕'
      },
      {
        id: 'public_2',
        name: 'Кафе для роботи',
        description: 'Місця з WiFi та розетками',
        author: 'Максим П.',
        places: 8,
        likes: 23,
        color: '#10b981',
        icon: '💼'
      }
    ];
  }
}

export default new CollectionsService();