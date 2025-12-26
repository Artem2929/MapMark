import { useMemo } from 'react'
import './Menu.css'

const Menu = ({ 
  children, 
  className = '',
  shadow = false,
  ...props 
}) => {
  const classes = useMemo(() => {
    const baseClass = 'menu'
    const shadowClass = shadow ? 'menu--shadow' : ''
    
    return [baseClass, shadowClass, className]
      .filter(Boolean)
      .join(' ')
  }, [shadow, className])

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export { Menu }
export default Menu