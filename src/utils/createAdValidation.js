import { isRequired, hasMinLength, isValidEmail, isValidImageFile, isValidFileSize } from './validation.js';

export const validateCreateAdForm = (formData, step, i18n) => {
  const errors = {};
  const isUkrainian = i18n.language.includes('uk');

  if (step === 1) {
    // Title validation
    if (!isRequired(formData.title?.trim())) {
      errors.title = isUkrainian ? 'Назва є обов\'язковою' : 'Title is required';
    } else if (formData.title.trim().length > 100) {
      errors.title = isUkrainian ? 'Назва не може перевищувати 100 символів' : 'Title cannot exceed 100 characters';
    }

    // Description validation
    if (!isRequired(formData.description?.trim())) {
      errors.description = isUkrainian ? 'Опис є обов\'язковим' : 'Description is required';
    } else if (!hasMinLength(formData.description.trim(), 10)) {
      errors.description = isUkrainian ? 'Опис повинен містити мінімум 10 символів' : 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 1000) {
      errors.description = isUkrainian ? 'Опис не може перевищувати 1000 символів' : 'Description cannot exceed 1000 characters';
    }

    // Category validation
    if (!isRequired(formData.category)) {
      errors.category = isUkrainian ? 'Категорія є обов\'язковою' : 'Category is required';
    }

    // Subcategory validation
    if (!isRequired(formData.subcategory)) {
      errors.subcategory = isUkrainian ? 'Підкатегорія є обов\'язковою' : 'Subcategory is required';
    }


  }

  if (step === 2) {
    // Location validation
    if (!isRequired(formData.country)) {
      errors.country = isUkrainian ? 'Країна є обов\'язковою' : 'Country is required';
    }

    if (!isRequired(formData.city)) {
      errors.city = isUkrainian ? 'Місто є обов\'язковим' : 'City is required';
    }

    if (!isRequired(formData.address?.trim())) {
      errors.address = isUkrainian ? 'Адреса є обов\'язковою' : 'Address is required';
    } else if (formData.address.trim().length > 200) {
      errors.address = isUkrainian ? 'Адреса не може перевищувати 200 символів' : 'Address cannot exceed 200 characters';
    }

    // Details validation
    if (!isRequired(formData.details)) {
      errors.details = isUkrainian ? 'Деталі є обов\'язковими' : 'Details are required';
    }

    // Price validation
    if (!isRequired(formData.price?.toString().trim())) {
      errors.price = isUkrainian ? 'Ціна є обов\'язковою' : 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        errors.price = isUkrainian ? 'Введіть коректну ціну' : 'Enter a valid price';
      } else if (price > 999999999) {
        errors.price = isUkrainian ? 'Ціна занадто велика' : 'Price is too high';
      }
    }

    // Contact validation - at least one contact method required
    const hasPhone = isRequired(formData.contactPhone?.trim());
    const hasEmail = isRequired(formData.contactEmail?.trim());

    if (!hasPhone && !hasEmail) {
      errors.contact = isUkrainian ? 'Вкажіть телефон або email для зв\'язку' : 'Provide phone or email for contact';
    }

    // Email validation if provided
    if (hasEmail && !isValidEmail(formData.contactEmail.trim())) {
      errors.contactEmail = isUkrainian ? 'Введіть коректний email' : 'Enter a valid email';
    }

    // Phone validation if provided
    if (hasPhone) {
      const cleanPhone = formData.contactPhone.replace(/[\s\-\(\)]/g, '');
      if (!/^[\+]?[1-9][\d]{7,15}$/.test(cleanPhone)) {
        errors.contactPhone = isUkrainian ? 'Введіть коректний номер телефону' : 'Enter a valid phone number';
      }
    }

    // Photos validation
    if (!formData.photos || formData.photos.length === 0) {
      errors.photos = isUkrainian ? 'Додайте хоча б одне фото' : 'Add at least one photo';
    } else if (formData.photos.length > 5) {
      errors.photos = isUkrainian ? 'Максимум 5 фото' : 'Maximum 5 photos';
    } else {
      // Validate each photo
      for (const photo of formData.photos) {
        if (photo.file && !isValidImageFile(photo.file)) {
          errors.photos = isUkrainian ? 'Дозволені тільки зображення (JPEG, PNG, WebP)' : 'Only images are allowed (JPEG, PNG, WebP)';
          break;
        }
        if (photo.file && !isValidFileSize(photo.file, 5)) {
          errors.photos = isUkrainian ? 'Розмір файлу не повинен перевищувати 5MB' : 'File size should not exceed 5MB';
          break;
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};