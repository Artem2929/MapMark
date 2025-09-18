// AR Service for MapMark - Augmented Reality Navigation and Features
class ARService {
  constructor() {
    this.isARSupported = this.checkARSupport();
    this.arSession = null;
    this.camera = null;
  }

  // Check if AR is supported
  checkARSupport() {
    return 'navigator' in window && 
           'mediaDevices' in navigator && 
           'getUserMedia' in navigator.mediaDevices;
  }

  // Initialize AR camera
  async initARCamera() {
    if (!this.isARSupported) {
      throw new Error('AR not supported on this device');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      return stream;
    } catch (error) {
      throw new Error('Camera access denied');
    }
  }

  // AR Navigation Overlay
  createAROverlay(places, userLocation) {
    return places.map(place => {
      const distance = this.calculateDistance(userLocation, place.location);
      const bearing = this.calculateBearing(userLocation, place.location);
      
      return {
        id: place.id,
        name: place.name,
        distance: Math.round(distance),
        bearing,
        rating: place.rating,
        category: place.category,
        arPosition: this.calculateARPosition(bearing, distance),
        color: this.getCategoryColor(place.category)
      };
    });
  }

  // Calculate AR position on screen
  calculateARPosition(bearing, distance) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Convert bearing to screen position
    const x = (bearing / 360) * screenWidth;
    const y = Math.max(100, screenHeight - (distance * 2)); // Closer = lower on screen
    
    return { x, y };
  }

  // Calculate distance between two points
  calculateDistance(pos1, pos2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(pos2.lat - pos1.lat);
    const dLon = this.toRad(pos2.lng - pos1.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(pos1.lat)) * Math.cos(this.toRad(pos2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Convert to meters
  }

  // Calculate bearing between two points
  calculateBearing(pos1, pos2) {
    const dLon = this.toRad(pos2.lng - pos1.lng);
    const lat1 = this.toRad(pos1.lat);
    const lat2 = this.toRad(pos2.lat);
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x);
    bearing = this.toDeg(bearing);
    return (bearing + 360) % 360;
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  toDeg(rad) {
    return rad * (180 / Math.PI);
  }

  // Get category color for AR markers
  getCategoryColor(category) {
    const colors = {
      'Кафе': '#FF6B6B',
      'Ресторан': '#4ECDC4',
      'Парк': '#45B7D1',
      'Музей': '#96CEB4',
      'Магазин': '#FFEAA7',
      'Готель': '#DDA0DD',
      'Бар': '#FF7675',
      'Спорт': '#74B9FF'
    };
    return colors[category] || '#6C5CE7';
  }

  // AR Photo Mode - Add location info to photos
  async captureARPhoto(canvas, locationInfo) {
    const ctx = canvas.getContext('2d');
    
    // Add AR overlay to photo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`📍 ${locationInfo.name}`, 20, canvas.height - 60);
    ctx.fillText(`⭐ ${locationInfo.rating} | 📍 ${locationInfo.distance}m`, 20, canvas.height - 30);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  // AR Review Mode - Show floating reviews
  createFloatingReviews(reviews, userLocation) {
    return reviews.map((review, index) => ({
      id: review.id,
      text: review.text.substring(0, 50) + '...',
      rating: review.rating,
      author: review.author,
      position: {
        x: 50 + (index % 3) * 100,
        y: 150 + Math.floor(index / 3) * 80
      },
      opacity: Math.max(0.3, 1 - (index * 0.1))
    }));
  }

  // Device orientation for AR
  async requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      return permission === 'granted';
    }
    return true; // Android or older iOS
  }

  // Get device orientation
  getDeviceOrientation() {
    return new Promise((resolve) => {
      const handleOrientation = (event) => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation);
        window.removeEventListener('deviceorientation', handleOrientation);
        
        resolve({
          alpha: event.alpha, // Compass direction
          beta: event.beta,   // Tilt front/back
          gamma: event.gamma  // Tilt left/right
        });
      };

      // Try absolute first (more accurate)
      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientation);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    });
  }

  // AR Walking Directions
  generateARDirections(route) {
    return route.steps.map((step, index) => ({
      instruction: step.instruction,
      distance: step.distance,
      direction: step.direction,
      arIcon: this.getDirectionIcon(step.direction),
      position: index * 50 // Spacing between instructions
    }));
  }

  getDirectionIcon(direction) {
    const icons = {
      'straight': '⬆️',
      'left': '⬅️',
      'right': '➡️',
      'slight_left': '↖️',
      'slight_right': '↗️',
      'sharp_left': '↙️',
      'sharp_right': '↘️'
    };
    return icons[direction] || '⬆️';
  }

  // Cleanup AR session
  stopAR() {
    if (this.camera) {
      this.camera.getTracks().forEach(track => track.stop());
      this.camera = null;
    }
    this.arSession = null;
  }
}

export default new ARService();