import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import Container from './Container';
import './Section.css';

const Section = memo(({  
  children, 
  title,
  subtitle,
  icon,
  spacing = 'large',
  background = 'transparent',
  className = '',
  containerSize = 'default',
  ...props 
 }) => {
  const sectionClasses = [
    'section',
    `section--spacing-${spacing}`,
    `section--bg-${background}`,
    className
  ].filter(Boolean).join(' ');

Section.displayName = 'Section';

  return (
    <section className={sectionClasses} {...props}>
      <Container size={containerSize}>
        {(title || subtitle || icon) && (
          <div className="section__header">
            {icon && <div className="section__icon">{icon}</div>}
            {title && <h2 className="section__title">{title}</h2>}
            {subtitle && <p className="section__subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="section__content">
          {children}
        </div>
      </Container>
    </section>
  );
};

export default Section;