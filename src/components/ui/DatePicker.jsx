import React, { useState } from 'react';
import CustomSelect from './CustomSelect';
import './DatePicker.css';

const DatePicker = ({ value, onChange, placeholder = "Оберіть дату" }) => {
  const parseDate = (dateString) => {
    if (!dateString) return { day: '', month: '', year: '' };
    const date = new Date(dateString);
    return {
      day: date.getDate().toString(),
      month: (date.getMonth() + 1).toString(),
      year: date.getFullYear().toString()
    };
  };

  const [dateComponents, setDateComponents] = useState(parseDate(value));

  const months = [
    { value: '1', label: 'Січень' },
    { value: '2', label: 'Лютий' },
    { value: '3', label: 'Березень' },
    { value: '4', label: 'Квітень' },
    { value: '5', label: 'Травень' },
    { value: '6', label: 'Червень' },
    { value: '7', label: 'Липень' },
    { value: '8', label: 'Серпень' },
    { value: '9', label: 'Вересень' },
    { value: '10', label: 'Жовтень' },
    { value: '11', label: 'Листопад' },
    { value: '12', label: 'Грудень' }
  ];

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString()
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }));

  const handleDateChange = (field, newValue) => {
    const newComponents = { ...dateComponents, [field]: newValue };
    setDateComponents(newComponents);

    if (newComponents.day && newComponents.month && newComponents.year) {
      const dateString = `${newComponents.year}-${newComponents.month.padStart(2, '0')}-${newComponents.day.padStart(2, '0')}`;
      onChange?.(dateString);
    }
  };

  return (
    <div className="date-picker">
      <div className="date-picker__selects">
        <CustomSelect
          value={dateComponents.day}
          onChange={(value) => handleDateChange('day', value)}
          options={days}
          placeholder="День"
          className="date-picker__select"
        />
        <CustomSelect
          value={dateComponents.month}
          onChange={(value) => handleDateChange('month', value)}
          options={months}
          placeholder="Місяць"
          className="date-picker__select"
        />
        <CustomSelect
          value={dateComponents.year}
          onChange={(value) => handleDateChange('year', value)}
          options={years}
          placeholder="Рік"
          className="date-picker__select"
        />
      </div>
    </div>
  );
};

export default DatePicker;