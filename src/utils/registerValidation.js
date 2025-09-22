export const validateRegistrationForm = (formData) => {
  const errors = {};

  // Валідація імені
  if (!formData.name.trim()) {
    errors.name = "Ім'я обов'язкове";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Ім'я повинно містити мінімум 2 символи";
  } else if (formData.name.trim().length > 50) {
    errors.name = "Ім'я не може перевищувати 50 символів";
  } else if (!/^[a-zA-Zа-яА-ЯіІїЇєЄ'\-\s]+$/.test(formData.name.trim())) {
    errors.name = "Ім'я може містити тільки літери";
  } else if (/\s{2,}/.test(formData.name)) {
    errors.name = "Ім'я не може містити подвійні пробіли";
  }

  // Валідація email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    errors.email = "Email обов'язковий";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Невірний формат email";
  } else if (formData.email.length > 100) {
    errors.email = "Email не може перевищувати 100 символів";
  }

  // Валідація паролю
  if (!formData.password) {
    errors.password = "Пароль обов'язковий";
  } else if (formData.password.length < 6) {
    errors.password = "Пароль повинен містити мінімум 6 символів";
  } else if (formData.password.length > 128) {
    errors.password = "Пароль не може перевищувати 128 символів";
  } else if (!/(?=.*[a-z])/.test(formData.password)) {
    errors.password = "Пароль повинен містити малу літеру";
  } else if (!/(?=.*[A-Z])/.test(formData.password)) {
    errors.password = "Пароль повинен містити велику літеру";
  } else if (!/(?=.*\d)/.test(formData.password)) {
    errors.password = "Пароль повинен містити цифру";
  }

  // Валідація підтвердження паролю
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Підтвердження паролю обов'язкове";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Паролі не співпадають";
  }

  // Валідація чекбоксів
  if (!formData.acceptTerms) {
    errors.acceptTerms = "Ви повинні прийняти умови використання";
  }

  if (!formData.acceptPrivacy) {
    errors.acceptPrivacy = "Ви повинні прийняти політику конфіденційності";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};