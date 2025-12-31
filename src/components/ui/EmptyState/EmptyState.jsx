import './EmptyState.css'

export function EmptyState({ children, size = 'default' }) {
  const className = `empty-state ${size !== 'default' ? `empty-state--${size}` : ''}`
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}