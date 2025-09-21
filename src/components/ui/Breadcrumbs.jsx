import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Breadcrumbs.css";

const Breadcrumbs = ({ items = null }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap = {
    '/ads': 'Оголошення',
    '/create-ad': 'Створити оголошення',
    '/about': 'Про нас',
    '/contact': 'Контакти',
    '/help': 'Допомога',
    '/profile': 'Профіль',
    '/settings': 'Налаштування'
  };

  // Якщо передані кастомні елементи, використовуємо їх
  if (items) {
    return (
      <nav className="breadcrumbs">
        {items.map((item, index) => (
          <span key={index} className="breadcrumb-item">
            {index > 0 && <span className="breadcrumb-separator">›</span>}
            {item.link ? (
              <Link to={item.link} className="breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-current">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    );
  }

  // Автоматичне генерування на основі URL
  return (
    <nav className="breadcrumbs">
      <span className="breadcrumb-item">
        <Link to="/" className="breadcrumb-link">
          Головна
        </Link>
      </span>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = breadcrumbNameMap[to] || value;

        return (
          <span key={to} className="breadcrumb-item">
            <span className="breadcrumb-separator">›</span>
            {isLast ? (
              <span className="breadcrumb-current">{name}</span>
            ) : (
              <Link to={to} className="breadcrumb-link">
                {name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;