import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Breadcrumbs.css";

const Breadcrumbs = ({ items }) => {
  const { t } = useTranslation();

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
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;