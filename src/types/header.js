export interface User {
  id: string
  name: string
  email: string
}

export interface AuthLink {
  to: string
  text: string
}

export interface HeaderProps {
  className?: string
}

export interface NavigationState {
  isMenuOpen: boolean
  isAuthenticated: boolean
  user: User | null
  currentPath: string
}