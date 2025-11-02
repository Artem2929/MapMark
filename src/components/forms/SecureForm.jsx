import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const SecureForm = ({ 
  schema, 
  onSubmit, 
  children, 
  className = '',
  defaultValues = {} 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    getValues
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange'
  });

  const onFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className={className}
      noValidate
    >
      {children({ 
        register, 
        errors, 
        isSubmitting, 
        reset, 
        watch, 
        setValue, 
        getValues 
      })}
    </form>
  );
};

// Common validation schemas
export const validationSchemas = {
  login: yup.object({
    email: yup
      .string()
      .email('Введіть коректний email')
      .required('Email обов\'язковий'),
    password: yup
      .string()
      .min(6, 'Пароль повинен містити мінімум 6 символів')
      .required('Пароль обов\'язковий')
  }),

  register: yup.object({
    firstName: yup
      .string()
      .min(2, 'Ім\'я повинно містити мінімум 2 символи')
      .max(50, 'Ім\'я не може перевищувати 50 символів')
      .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄ'\\-\\s]+$/, 'Ім\'я може містити лише літери')
      .required('Ім\'я обов\'язкове'),
    lastName: yup
      .string()
      .min(2, 'Прізвище повинно містити мінімум 2 символи')
      .max(50, 'Прізвище не може перевищувати 50 символів')
      .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄ'\\-\\s]+$/, 'Прізвище може містити лише літери')
      .required('Прізвище обов\'язкове'),
    email: yup
      .string()
      .email('Введіть коректний email')
      .required('Email обов\'язковий'),
    password: yup
      .string()
      .min(8, 'Пароль повинен містити мінімум 8 символів')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Пароль повинен містити великі та малі літери, цифри'
      )
      .required('Пароль обов\'язковий'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Паролі не співпадають')
      .required('Підтвердження паролю обов\'язкове')
  }),

  review: yup.object({
    text: yup
      .string()
      .min(10, 'Відгук повинен містити мінімум 10 символів')
      .max(1000, 'Відгук не може перевищувати 1000 символів')
      .required('Текст відгуку обов\'язковий'),
    rating: yup
      .number()
      .min(1, 'Оцінка повинна бути від 1 до 5')
      .max(5, 'Оцінка повинна бути від 1 до 5')
      .required('Оцінка обов\'язкова')
  })
};

export default SecureForm;