import i18n from '../i18n';

export const getErrorMessage = (errorKey, fallback) => {
  const translatedMessage = i18n.t(`login.errors.${errorKey}`);
  
  // Якщо переклад не знайдено, повертаємо fallback
  if (translatedMessage === `login.errors.${errorKey}`) {
    return fallback;
  }
  
  return translatedMessage;
};

export const translateAuthError = (error) => {
  const errorMessage = error.message;
  
  // Мапінг помилок на ключі перекладів
  const errorMap = {
    'Невірний email або пароль': 'invalidCredentials',
    'Забагато спроб входу. Спробуйте пізніше': 'tooManyAttempts',
    'Перевірте правильність введених даних': 'invalidData',
    'Помилка сервера. Спробуйте пізніше': 'serverError',
    'Помилка підключення до сервера': 'connectionError',
    'Помилка входу': 'loginError',
    'Користувач з таким email вже існує': 'userExists',
    'Помилка валідації': 'validationError',
    'Помилка реєстрації': 'registrationError'
  };
  
  const errorKey = errorMap[errorMessage];
  
  if (errorKey) {
    return getErrorMessage(errorKey, errorMessage);
  }
  
  return errorMessage;
};