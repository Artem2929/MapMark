import React from 'react'
import './Loading.css'

const Loading = ({ size = 'md', text = 'Завантаження...', className = '' }) => {
  const sizeClass = `loading--${size}`
  const classes = ['loading', sizeClass, className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className="loading__spinner" />
      {text && <span className="loading__text">{text}</span>}
    </div>
  )
}

export { Loading }
export default Loading