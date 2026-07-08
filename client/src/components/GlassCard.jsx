import React from 'react';

/**
 * Reusable Card component with custom Glassmorphism style
 */
const GlassCard = ({ children, className = '', interactive = false, ...props }) => {
  const cardClass = interactive ? 'glass-panel-interactive' : 'glass-panel';

  return (
    <div
      className={`${cardClass} rounded-2xl p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
