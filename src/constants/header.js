export const HEADER_CONFIG = {
  HEIGHT: 80,
  Z_INDEX: 1000,
  ANIMATION_DURATION: 300,
  BLUR_AMOUNT: 20
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ABOUT: '/about',
  PROFILE: (userId) => `/profile/${userId}`
}

export const NAVIGATION_LABELS = {
  PROFILE: 'Мій профіль',
  LOGOUT: 'Вийти',
  LOGIN: 'Увійти',
  REGISTER: 'Зареєструватись',
  ABOUT: 'Про нас',
  MENU: 'Меню'
}