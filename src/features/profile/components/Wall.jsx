import React from 'react'
import './Wall.css'

const Wall = ({ userId, isOwnProfile }) => {
  return (
    <div className="wall-container">
      <h3 className="wall__title">Стіна</h3>
      {isOwnProfile && (
        <div className="wall__post-form">
          <textarea 
            placeholder="Що у вас нового?"
            className="wall__textarea"
          />
          <button className="wall__submit-btn">
            Опублікувати
          </button>
        </div>
      )}
      <p className="wall__empty">
        Записів поки немає
      </p>
    </div>
  )
}

export default Wall