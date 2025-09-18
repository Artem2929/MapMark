import React from 'react';
import Container from './Container';
import './Hero.css';

const Hero = ({ 
  icon,
  title, 
  subtitle, 
  children,
  variant = 'default',
  className = '',
  ...props 
}) => {
  const heroClasses = [
    'hero',
    `hero--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={heroClasses} {...props}>
      <Container>
        <div className="hero__content">
          {icon && <div className="hero__icon">{icon}</div>}
          {title && <h1 className="hero__title">{title}</h1>}
          {subtitle && <p className="hero__subtitle">{subtitle}</p>}
          {children}
        </div>
      </Container>
    </section>
  );
};

export default Hero;