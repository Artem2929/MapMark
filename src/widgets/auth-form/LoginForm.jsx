import { Input } from '../../shared/ui/Input.jsx'
import { Button } from '../../shared/ui/Button.jsx'
import { useForm } from './useForm.js'
import { useLogin } from '../../features/auth/login/useLogin.js'
import { loginSchema } from '../../features/auth/validation/validators.js'
import './LoginForm.css'

export function LoginForm() {
  const { login, loading, error, clearError } = useLogin()
  
  const form = useForm(
    { email: '', password: '' },
    loginSchema
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    if (!form.validateAll()) return
    
    await login(form.values)
  }

  const handleFieldChange = (name) => (e) => {
    form.setValue(name, e.target.value)
  }

  const handleFieldBlur = (name) => () => {
    form.setFieldTouched(name)
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}
      
      <Input
        type="email"
        placeholder="Email"
        value={form.values.email}
        onChange={handleFieldChange('email')}
        onBlur={handleFieldBlur('email')}
        error={form.touched.email ? form.errors.email : null}
        disabled={loading}
      />
      
      <Input
        type="password"
        placeholder="Пароль"
        value={form.values.password}
        onChange={handleFieldChange('password')}
        onBlur={handleFieldBlur('password')}
        error={form.touched.password ? form.errors.password : null}
        disabled={loading}
      />
      
      <Button
        type="submit"
        loading={loading}
        disabled={!form.isValid || loading}
      >
        Увійти
      </Button>
    </form>
  )
}