import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import Header from './Header.optimized';
import Footer from './Footer';
import { Container, Breadcrumbs } from '../ui';
import './PageLayout.css';

const PageLayout = ({ 
  children,
  showBreadcrumbs = true,
  showFooter = true,
  containerSize = 'default',
  background = 'secondary',
  className = '',
  headerProps = {},
  ...props 
}) => {
  return (
    <div className={`page-layout page-layout--bg-${background} ${className}`} {...props}>
      <Header {...headerProps} />
      
      <main className="page-layout__main">
        {showBreadcrumbs && (
          <Container size={containerSize}>
            <Breadcrumbs />
          </Container>
        )}
        
        <div className="page-layout__content">
          {children}
        </div>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;