export const messageSchema = {
  text: {
    required: true,
    minLength: 1,
    maxLength: 1000,
    message: 'Повідомлення повинно містити від 1 до 1000 символів'
  },
  sender: {
    required: true,
    type: 'string',
    enum: ['me', 'other'],
    message: 'Невірний відправник повідомлення'
  },
  timestamp: {
    required: true,
    type: 'string',
    message: 'Час відправки обов\'язковий'
  }
};

export const chatUserSchema = {
  id: {
    required: true,
    type: 'string',
    message: 'ID користувача обов\'язкове'
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Ім\'я повинно містити від 2 до 50 символів'
  },
  username: {
    required: false,
    type: 'string',
    message: 'Невірний формат username'
  },
  avatar: {
    required: false,
    type: 'string',
    message: 'Невірний URL аватара'
  },
  online: {
    required: false,
    type: 'boolean',
    message: 'Статус онлайн повинен бути boolean'
  }
};