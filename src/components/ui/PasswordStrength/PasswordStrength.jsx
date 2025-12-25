import './PasswordStrength.css'

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }
  
  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }
  
  score = Object.values(checks).filter(Boolean).length
  
  const levels = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Дуже слабкий', color: '#ff4444' },
    { score: 2, label: 'Слабкий', color: '#ff8800' },
    { score: 3, label: 'Середній', color: '#ffaa00' },
    { score: 4, label: 'Сильний', color: '#88cc00' },
    { score: 5, label: 'Дуже сильний', color: '#00cc44' }
  ]
  
  return levels[score]
}

export function PasswordStrength({ password }) {
  const strength = getPasswordStrength(password)
  
  if (!password) return null
  
  return (
    <div className="password-strength">
      <div className="password-strength__bar">
        <div 
          className="password-strength__fill"
          style={{ 
            width: `${(strength.score / 5) * 100}%`,
            backgroundColor: strength.color 
          }}
        />
      </div>
      <span 
        className="password-strength__label"
        style={{ color: strength.color }}
      >
        {strength.label}
      </span>
    </div>
  )
}