import React, { memo } from 'react'

const DatePicker = memo(({ value, onChange, placeholder }) => {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input"
    />
  )
})

DatePicker.displayName = 'DatePicker'

export default DatePicker