# MapMark - Interactive Map Review Platform

A modern React application for discovering and reviewing places on an interactive map.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠 Development

### Code Quality

```bash
# Lint JavaScript/React code
npm run lint
npm run lint:fix

# Lint CSS/SCSS
npm run lint:css
npm run lint:css:fix

# Format code
npm run format
npm run format:check
```

### Architecture

This project follows a clean architecture with:

- **BEM CSS methodology** - No `!important` rules
- **CSS Custom Properties** - Consistent design tokens
- **React Hooks** - Functional components only
- **Custom Hooks** - Reusable logic extraction
- **Modular Structure** - Small, focused components

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed guidelines.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── styles/             # Global styles and utilities
├── utils/              # Utility functions
├── constants/          # Application constants
└── App.css            # Main stylesheet
```

## 🎨 Styling

- **CSS Variables** for theming and consistency
- **BEM methodology** for component styling
- **Mobile-first** responsive design
- **Dark/Light theme** support
- **No !important** rules - proper CSS specificity

## 🔧 Tools & Configuration

- **ESLint** - Code linting with React rules
- **Prettier** - Code formatting
- **Stylelint** - CSS linting with BEM enforcement
- **EditorConfig** - Consistent editor settings

## 📚 Key Features

- Interactive map with place markers
- User reviews and ratings
- Theme switching (light/dark/system)
- Responsive design
- Clean, accessible UI
- Performance optimized

## 🤝 Contributing

1. Follow the established architecture patterns
2. Use BEM methodology for CSS
3. Write functional components with hooks
4. Extract reusable logic into custom hooks
5. Run linting before committing

## 📖 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed project architecture
- [Component Examples](./src/components/ui/Button.jsx) - Reference implementations
- [CSS Guidelines](./src/styles/) - Styling conventions