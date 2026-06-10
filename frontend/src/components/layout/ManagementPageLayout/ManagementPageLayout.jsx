import React from 'react';
import './ManagementPageLayout.css';

export function ManagementPageLayout({ title, subtitle, toolbar, children }) {
  return (
    <div className="management-page">
      <header className="management-page__header">
        <h1 className="management-page__title">{title}</h1>
        {subtitle && <p className="management-page__subtitle">{subtitle}</p>}
      </header>

      <div className="management-card">
        {toolbar && <div className="management-page__toolbar">{toolbar}</div>}
        <div className="management-page__content">
          {children}
        </div>
      </div>
    </div>
  );
}
