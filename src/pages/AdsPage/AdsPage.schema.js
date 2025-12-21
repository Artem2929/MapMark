export const adsFilterSchema = {
  country: {
    required: false,
    type: 'string',
    message: 'Оберіть країну'
  },
  region: {
    required: false,
    type: 'string',
    message: 'Оберіть регіон'
  },
  category: {
    required: false,
    type: 'string',
    message: 'Оберіть категорію'
  },
  rating: {
    required: false,
    type: 'number',
    min: 0,
    max: 5,
    message: 'Рейтинг повинен бути від 0 до 5'
  },
  distance: {
    required: false,
    type: 'number',
    min: 0,
    message: 'Відстань повинна бути позитивним числом'
  },
  sortBy: {
    required: false,
    type: 'string',
    enum: ['rating', 'distance', 'popular', 'newest'],
    message: 'Невірний тип сортування'
  }
};

export const createAdSchema = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 100,
    message: 'Заголовок повинен містити від 5 до 100 символів'
  },
  description: {
    required: true,
    minLength: 20,
    maxLength: 1000,
    message: 'Опис повинен містити від 20 до 1000 символів'
  },
  category: {
    required: true,
    type: 'string',
    message: 'Категорія обов\'язкова'
  },
  location: {
    required: true,
    type: 'object',
    message: 'Місцезнаходження обов\'язкове'
  }
};