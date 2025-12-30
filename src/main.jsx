import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/variables.css'
import './styles/globals.css'
import './styles/utilities.css'
import './styles/layout.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a div with id="root" in your HTML.')
}

const root = createRoot(rootElement)
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)