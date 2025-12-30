// User type definition
export const UserType = {
  id: 'string',
  name: 'string',
  email: 'string'
}

// Auth link type definition
export const AuthLinkType = {
  to: 'string',
  text: 'string'
}

// Header props type definition
export const HeaderPropsType = {
  className: 'string' // optional
}

// Navigation state type definition
export const NavigationStateType = {
  isMenuOpen: 'boolean',
  isAuthenticated: 'boolean',
  user: 'object', // User | null
  currentPath: 'string'
}