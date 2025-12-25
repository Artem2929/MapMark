export const HEADER_CONFIG = {
  HEIGHT: 80,
  Z_INDEX: 1000,
  ANIMATION_DURATION: 300,
  BLUR_AMOUNT: 20
}

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: (userId) => `/profile/${userId}`
}

export const NAVIGATION_LABELS = {
  PROFILE: 'Мій профіль',
  LOGOUT: 'Вийти',
  LOGIN: 'Увійти',
  REGISTER: 'Зареєструватись',
  MENU: 'Меню'
}