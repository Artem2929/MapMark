export const validateRegistrationForm = (formData, t) => {
  const errors = {};

  // Валідація імені
  if (!formData.name.trim()) {
    errors.name = t('register.validation.nameRequired');
  } else if (formData.name.trim().length < 2) {
    errors.name = t('register.validation.nameMinLength');
  }

  // Валідація email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    errors.email = t('register.validation.emailRequired');
  } else if (!emailRegex.test(formData.email)) {
    errors.email = t('register.validation.emailInvalid');
  }

  // Валідація паролю
  if (!formData.password) {
    errors.password = t('register.validation.passwordRequired');
  } else if (formData.password.length < 6) {
    errors.password = t('register.validation.passwordMinLength');
  }

  // Валідація підтвердження паролю
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Підтвердження паролю обов'язкове";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Паролі не співпадають";
  }

  // Валідація ролі
  if (!formData.role) {
    errors.role = t('register.validation.roleRequired');
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