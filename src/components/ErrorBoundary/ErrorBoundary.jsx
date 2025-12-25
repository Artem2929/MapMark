import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: 'var(--color-error-light)',
          border: '1px solid var(--color-error)',
          borderRadius: 'var(--radius-md)',
          margin: '20px'
        }}>
          <h2>Щось пішло не так</h2>
          <p>Сталася помилка в додатку. Спробуйте оновити сторінку.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Оновити сторінку
          </button>
        </div>
      )
    }

    return this.props.children
  }
}