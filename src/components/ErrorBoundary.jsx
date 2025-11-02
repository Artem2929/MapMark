import React from 'react';
import ErrorMessage from './ui/ErrorMessage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <ErrorMessage 
            title="Щось пішло не так"
            message="Сталася неочікувана помилка. Спробуйте оновити сторінку."
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;