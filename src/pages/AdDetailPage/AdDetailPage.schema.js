export const reviewSchema = {
  rating: {
    required: true,
    min: 1,
    max: 5,
    message: 'Оцінка обов\'язкова (від 1 до 5)'
  },
  text: {
    required: true,
    minLength: 10,
    maxLength: 500,
    message: 'Відгук повинен містити від 10 до 500 символів'
  },
  author: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Ім\'я повинно містити від 2 до 50 символів'
  }
};

export const adDetailSchema = {
  id: {
    required: true,
    type: 'number',
    message: 'ID оголошення обов\'язкове'
  }
};