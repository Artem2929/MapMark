# MapMark Architecture Guide

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   ├── features/       # Feature-specific components
│   └── map/            # Map-related components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── styles/             # Global styles and utilities
│   ├── variables.css   # CSS custom properties
│   ├── bem-components.css # BEM methodology components
│   ├── components.css  # Utility components
│   ├── animations.css  # Animation utilities
│   └── responsive.css  # Responsive utilities
├── utils/              # Utility functions
└── App.css            # Main stylesheet
```

## CSS Architecture

### 1. CSS Variables (Custom Properties)
- All colors, spacing, typography defined in `styles/variables.css`
- Theme support with `.theme-light` and `.theme-dark` classes
- Consistent design tokens across the application

### 2. BEM Methodology
- Block Element Modifier naming convention
- Components in `styles/bem-components.css`
- Use `createBEM()` utility for consistent class generation

### 3. No !important Rule
- Proper CSS specificity instead of `!important`
- Stylelint enforces this rule
- Use CSS cascade and specificity correctly

### 4. Component Structure
```css
/* Block */
.component { }

/* Element */
.component__element { }

/* Modifier */
.component--modifier { }
.component__element--modifier { }
```

## React Architecture

### 1. Component Guidelines
- Functional components with hooks
- Small, reusable components
- Props validation with PropTypes (optional)
- Consistent file naming: PascalCase.jsx

### 2. Custom Hooks
- Extract reusable logic into custom hooks
- Prefix with `use` (e.g., `useTheme`, `useLocalStorage`)
- Keep hooks focused on single responsibility

### 3. State Management
- Local state with `useState`
- Complex state with `useReducer`
- Global state with Zustand (if needed)

## Code Quality Tools

### 1. ESLint Configuration
- React-specific rules
- Hooks rules enforcement
- Code quality rules (no-unused-vars, prefer-const, etc.)

### 2. Prettier Configuration
- Consistent code formatting
- 2-space indentation
- Single quotes
- Trailing commas

### 3. Stylelint Configuration
- CSS/SCSS linting
- BEM pattern enforcement
- No !important rule
- Property ordering

### 4. EditorConfig
- Consistent editor settings
- UTF-8 encoding
- LF line endings
- Trim trailing whitespace

## Development Workflow

### 1. Before Making Changes
```bash
# Check code quality
npm run lint
npm run lint:css
npm run format:check
```

### 2. Fix Issues
```bash
# Auto-fix linting issues
npm run lint:fix
npm run lint:css:fix
npm run format
```

### 3. Component Development
1. Create component in appropriate directory
2. Use BEM methodology for CSS classes
3. Extract reusable logic into custom hooks
4. Follow existing patterns and conventions

### 4. Styling Guidelines
- Use CSS variables for all values
- Follow BEM naming convention
- Mobile-first responsive design
- Prefer CSS Grid/Flexbox over floats
- Use semantic HTML elements

## Theme System

### 1. Theme Hook
```javascript
import { useTheme } from './hooks/useTheme';

function Component() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {isDark ? 'light' : 'dark'} theme
    </button>
  );
}
```

### 2. CSS Variables
```css
.component {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-light);
}
```

## Utility Functions

### 1. Class Names
```javascript
import { classNames, bem, createBEM } from './utils/classNames';

// Combine classes
const classes = classNames('base', { active: isActive }, 'extra');

// BEM utility
const btnClass = createBEM('btn');
const className = btnClass('icon', { large: isLarge, primary: isPrimary });
```

## Performance Guidelines

### 1. CSS Performance
- Use CSS custom properties for dynamic values
- Minimize CSS bundle size
- Use efficient selectors
- Avoid deep nesting

### 2. React Performance
- Use React.memo for expensive components
- Optimize re-renders with useMemo/useCallback
- Lazy load components when appropriate
- Keep component tree shallow

## Accessibility

### 1. Semantic HTML
- Use proper HTML elements
- Include ARIA attributes when needed
- Ensure keyboard navigation
- Maintain focus management

### 2. CSS Accessibility
- Respect `prefers-reduced-motion`
- Ensure sufficient color contrast
- Support high contrast mode
- Use relative units for scalability

## Testing Strategy

### 1. Component Testing
- Test component behavior, not implementation
- Use React Testing Library
- Test accessibility features
- Mock external dependencies

### 2. CSS Testing
- Visual regression testing
- Cross-browser compatibility
- Responsive design testing
- Theme switching testing