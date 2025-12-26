import React, { memo } from 'react'

const PhotosSection = memo(() => {
  return (
    <div className="photos-section">
      <div className="photos-section__header">
        <h3 className="photos-section__title">Фотографії</h3>
      </div>
      <div className="photos-section__content">
        <p className="photos-section__empty">Фотографії відсутні</p>
      </div>
    </div>
  )
})

PhotosSection.displayName = 'PhotosSection'

export default PhotosSection