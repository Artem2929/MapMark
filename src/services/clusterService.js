// Smart Clusters Service - Розумне групування місць
class ClusterService {
  constructor() {
    this.clusterRadius = 200; // meters
  }

  // Групування місць в кластери
  createClusters(places, zoom) {
    if (!places || places.length === 0) return [];
    
    const clusters = [];
    const processed = new Set();
    
    places.forEach((place, index) => {
      if (processed.has(index)) return;
      
      const cluster = {
        id: `cluster_${index}`,
        center: { lat: place.lat, lng: place.lng },
        places: [place],
        bounds: this.calculateBounds([place])
      };
      
      // Знаходимо сусідні місця
      places.forEach((otherPlace, otherIndex) => {
        if (index === otherIndex || processed.has(otherIndex)) return;
        
        const distance = this.calculateDistance(place, otherPlace);
        if (distance <= this.clusterRadius) {
          cluster.places.push(otherPlace);
          processed.add(otherIndex);
        }
      });
      
      // Перерахунок центру кластера
      if (cluster.places.length > 1) {
        cluster.center = this.calculateClusterCenter(cluster.places);
        cluster.bounds = this.calculateBounds(cluster.places);
      }
      
      clusters.push(cluster);
      processed.add(index);
    });
    
    return clusters;
  }

  // Розрахунок відстані між двома точками
  calculateDistance(place1, place2) {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(place2.lat - place1.lat);
    const dLng = this.toRad(place2.lng - place1.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(place1.lat)) * Math.cos(this.toRad(place2.lat)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Розрахунок центру кластера
  calculateClusterCenter(places) {
    const totalLat = places.reduce((sum, place) => sum + place.lat, 0);
    const totalLng = places.reduce((sum, place) => sum + place.lng, 0);
    
    return {
      lat: totalLat / places.length,
      lng: totalLng / places.length
    };
  }

  // Розрахунок меж кластера
  calculateBounds(places) {
    const lats = places.map(p => p.lat);
    const lngs = places.map(p => p.lng);
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  }

  // Отримання статистики кластера
  getClusterStats(cluster) {
    const ratings = cluster.places.filter(p => p.rating).map(p => p.rating);
    const avgRating = ratings.length > 0 ? 
      ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    
    const categories = [...new Set(cluster.places.map(p => p.category))];
    
    return {
      count: cluster.places.length,
      avgRating: Math.round(avgRating * 10) / 10,
      categories,
      priceRange: this.getPriceRange(cluster.places)
    };
  }

  getPriceRange(places) {
    const prices = places.filter(p => p.priceLevel).map(p => p.priceLevel);
    if (prices.length === 0) return null;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? min : `${min}-${max}`;
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }
}

export default new ClusterService();