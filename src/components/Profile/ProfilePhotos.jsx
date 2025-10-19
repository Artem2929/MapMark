import React from 'react';
import { Link } from 'react-router-dom';

const ProfilePhotos = () => {
  // Мок даних - масив фото користувача
  const userPhotos = [
    { id: 1, url: 'https://picsum.photos/200/200?random=1' },
    { id: 2, url: 'https://picsum.photos/200/200?random=2' }
    // { id: 3, url: 'https://picsum.photos/200/200?random=3' }
  ];
  
  const displayPhotos = userPhotos.slice(0, 3);
  
  if (displayPhotos.length === 0) {
    return (
      <div className="profile-photos">
        <div className="profile-photos__header">
          <span>Мої фото</span>
          <Link to="/photos" className="profile-photos__link">всі фото</Link>
        </div>
        <div className="profile-photos__empty">
          Користувач поки не додав фото
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile-photos">
      <div className="profile-photos__header">
        <span>Мої фото</span>
        <Link to="/photos" className="profile-photos__link">всі фото</Link>
      </div>
      <div className="profile-photos__grid">
        {displayPhotos.map(photo => (
          <Link key={photo.id} to={`/photos/${photo.id}`}>
            <img src={photo.url} alt={`Фото ${photo.id}`} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfilePhotos;